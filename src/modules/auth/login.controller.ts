import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  get,
  HttpErrors,
  param,
  post,
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import {
  authenticate,
  authenticateClient,
  AuthenticationBindings,
  AuthErrorKeys,
  ClientAuthCode,
  STRATEGY,
} from 'loopback4-authentication';
import {
  AuthorizationBindings,
  authorize,
  UserPermissionsFn,
} from 'loopback4-authorization';
import {URLSearchParams} from 'url';
import {CONTENT_TYPE, STATUS_CODE} from '../../constants';
import {AuthClient, RefreshToken, Role, Tenant} from '../../models';
import {
  AuthClientRepository,
  RefreshTokenRepository,
  UserRepository,
  UserTenantPermissionRepository,
  UserTenantRepository,
} from '../../repositories';
import {AuthRefreshTokenRequest, AuthTokenRequest, LoginRequest} from './';
import {AuthenticateErrorKeys} from './error-keys';
import {AuthUser} from './models/auth-user.model';
import {TokenResponse} from './models/token-response.dto';

export class LoginController {
  // sonarignore_start
  constructor(
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    private readonly client: AuthClient | undefined,
    @inject(AuthenticationBindings.CURRENT_USER)
    private readonly user: AuthUser | undefined,
    @inject(AuthorizationBindings.USER_PERMISSIONS)
    private readonly getUserPermissions: UserPermissionsFn<string>,
    @repository(RefreshTokenRepository)
    public refreshTokenRepo: RefreshTokenRepository,

    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserTenantRepository)
    public userTenantRepository: UserTenantRepository,
    @repository(UserTenantPermissionRepository)
    public utPermsRepo: UserTenantPermissionRepository,
  ) {}
  // sonarignore_end

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(STRATEGY.LOCAL)
  @authorize({permissions: ['*']})
  @post('/auth/login', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Auth Code',
        content: {
          [CONTENT_TYPE.JSON]: Object,
        },
      },
    },
  })
  async login(
    @requestBody()
    req: LoginRequest,
  ): Promise<{
    code: string;
  }> {
    if (!this.client || !this.user) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.ClientInvalid);
    } else if (!req.client_secret) {
      throw new HttpErrors.BadRequest(AuthErrorKeys.ClientSecretMissing);
    }
    try {
      const codePayload: ClientAuthCode<AuthUser, number> = {
        clientId: req.client_id,
        userId: this.user.id,
      };
      const {accessToken} = await this.createJWT(codePayload, this.client);
      return {
        code: accessToken,
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError(
        AuthErrorKeys.InvalidCredentials,
      );
    }
  }

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(STRATEGY.OAUTH2_RESOURCE_OWNER_GRANT)
  @authorize({permissions: ['*']})
  @post('/auth/login-token', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Token Response Model',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {'x-ts-type': TokenResponse},
          },
        },
      },
    },
  })
  async loginWithClientUser(
    @requestBody() req: LoginRequest,
  ): Promise<TokenResponse> {
    if (!this.client || !this.user) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.ClientInvalid);
    } else if (!this.client.userIds || this.client.userIds.length === 0) {
      throw new HttpErrors.UnprocessableEntity(AuthErrorKeys.ClientUserMissing);
    } else if (!req.client_secret) {
      throw new HttpErrors.BadRequest(AuthErrorKeys.ClientSecretMissing);
    }
    try {
      const payload: ClientAuthCode<AuthUser, number> = {
        clientId: this.client.clientId,
        user: this.user,
      };
      return await this.createJWT(payload, this.client);
    } catch (error) {
      throw new HttpErrors.InternalServerError(
        AuthErrorKeys.InvalidCredentials,
      );
    }
  }

  @authorize({permissions: ['*']})
  @post('/auth/token', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {'x-ts-type': TokenResponse},
          },
        },
      },
    },
  })
  async getToken(@requestBody() req: AuthTokenRequest): Promise<TokenResponse> {
    const authClient = await this.authClientRepository.findOne({
      where: {
        clientId: req.clientId,
      },
    });
    if (!authClient) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.ClientInvalid);
    }
    try {
      const payload: ClientAuthCode<AuthUser, number> = jwt.verify(
        req.code,
        authClient.secret,
        {
          audience: req.clientId,
          subject: req.username,
          issuer: process.env.JWT_ISSUER,
        },
      ) as ClientAuthCode<AuthUser, number>;

      return await this.createJWT(payload, authClient);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.CodeExpired);
        // eslint-disable-next-line no-prototype-builtins
      } else if (HttpErrors.HttpError.prototype.isPrototypeOf(error)) {
        throw error;
      } else {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
      }
    }
  }

  @authorize({permissions: ['*']})
  @post('/auth/token-refresh', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {'x-ts-type': TokenResponse},
          },
        },
      },
    },
  })
  async exchangeToken(
    @requestBody() req: AuthRefreshTokenRequest,
  ): Promise<TokenResponse> {
    const refreshPayload: RefreshToken = await this.refreshTokenRepo.get(
      req.refreshToken,
    );
    if (!refreshPayload) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.TokenExpired);
    }
    const authClient = await this.authClientRepository.findOne({
      where: {
        clientId: refreshPayload.clientId,
      },
    });
    if (!authClient) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.ClientInvalid);
    }
    return this.createJWT(
      {clientId: refreshPayload.clientId, userId: refreshPayload.userId},
      authClient,
    );
  }

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(
    STRATEGY.GOOGLE_OAUTH2,
    {
      accessType: 'offline',
      scope: ['profile', 'email'],
      authorizationURL: process.env.GOOGLE_AUTH_URL,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      tokenURL: process.env.GOOGLE_AUTH_TOKEN_URL,
    },
    (req: Request) => {
      return {
        accessType: 'offline',
        state: Object.keys(req.query)
          .map(key => key + '=' + req.query[key])
          .join('&'),
      };
    },
  )
  @authorize({permissions: ['*']})
  @get('/auth/google', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {'x-ts-type': TokenResponse},
          },
        },
      },
    },
  })
  async loginViaGoogle(
    @param.query.string('client_id')
    clientId?: string,
    @param.query.string('client_secret')
    clientSecret?: string,
  ): Promise<void> {}

  @authenticate(
    STRATEGY.GOOGLE_OAUTH2,
    {
      accessType: 'offline',
      scope: ['profile', 'email'],
      authorizationURL: process.env.GOOGLE_AUTH_URL,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      tokenURL: process.env.GOOGLE_AUTH_TOKEN_URL,
    },
    (req: Request) => {
      return {
        accessType: 'offline',
        state: Object.keys(req.query)
          .map(key => `${key}=${req.query[key]}`)
          .join('&'),
      };
    },
  )
  @authorize({permissions: ['*']})
  @get('/auth/google-auth-redirect', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {'x-ts-type': TokenResponse},
          },
        },
      },
    },
  })
  async googleCallback(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<void> {
    const clientId = new URLSearchParams(state).get('client_id');
    if (!clientId || !this.user) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.ClientInvalid);
    }
    const client = await this.authClientRepository.findOne({
      where: {
        clientId: clientId,
      },
    });
    if (!client || !client.redirectUrl) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.ClientInvalid);
    }
    try {
      const codePayload: ClientAuthCode<AuthUser, string> = {
        clientId,
        user: this.user,
      };
      const token = jwt.sign(codePayload, client.secret, {
        expiresIn: client.authCodeExpiration,
        audience: clientId,
        subject: this.user.username,
        issuer: process.env.JWT_ISSUER,
      });
      response.redirect(`${client.redirectUrl}?code=${token}`);
    } catch (error) {
      throw new HttpErrors.InternalServerError(AuthErrorKeys.UnknownError);
    }
  }

  private async createJWT(
    payload: ClientAuthCode<AuthUser, number>,
    authClient: AuthClient,
  ): Promise<TokenResponse> {
    try {
      let user: AuthUser | null | undefined;
      if (payload.user) {
        user = payload.user;
      } else if (payload.userId) {
        const authUser = await this.userRepository.findById(payload.userId);
        if (authUser) {
          user = new AuthUser(authUser.toJSON());
        }
      }
      if (!user) {
        throw new HttpErrors.Unauthorized(
          AuthenticateErrorKeys.UserDoesNotExist,
        );
      }
      const userTenant = await this.userTenantRepository.findOne({
        where: {
          userId: user.id,
          tenantId: user.defaultTenant,
        },
        include: [
          {model: Tenant, required: true},
          {model: Role, required: true},
        ],
      });
      if (!userTenant) {
        throw new HttpErrors.Unauthorized(
          AuthenticateErrorKeys.UserDoesNotExist,
        );
      } else if (userTenant.status !== 'active') {
        throw new HttpErrors.Unauthorized(AuthenticateErrorKeys.UserInactive);
      }
      // Create user DTO for payload to JWT
      const authUser: AuthUser = new AuthUser(user);
      authUser.tenant = userTenant.tenant.toJSON() as Tenant;
      const utPerms = await this.utPermsRepo.find({
        where: {
          userTenantId: `${userTenant?.id}`,
        },
        attributes: ['allowed', 'permission'],
      });
      authUser.permissions = this.getUserPermissions(
        utPerms,
        userTenant.role?.permissions as any,
      );
      authUser.role = userTenant.role?.roleKey.toString();
      const accessToken = jwt.sign(
        JSON.parse(JSON.stringify(authUser)),
        process.env.JWT_SECRET as string,
        {
          expiresIn: authClient.accessTokenExpiration,
          issuer: process.env.JWT_ISSUER,
        },
      );
      const size = 32,
        ms = 1000;
      const refreshToken: string = crypto.randomBytes(size).toString('hex');
      // Set refresh token into redis for later verification
      await this.refreshTokenRepo.set(
        refreshToken,
        {clientId: authClient.clientId, userId: user.id},
        {ttl: authClient.refreshTokenExpiration * ms},
      );
      return new TokenResponse({accessToken, refreshToken});
    } catch (error) {
      // eslint-disable-next-line no-prototype-builtins
      if (HttpErrors.HttpError.prototype.isPrototypeOf(error)) {
        throw error;
      } else {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
      }
    }
  }
}
