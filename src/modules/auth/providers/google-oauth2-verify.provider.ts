import {Provider} from '@loopback/context';
import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {AuthErrorKeys, VerifyFunction} from 'loopback4-authentication';
import {Tenant} from '../../../models';
import {UserCredentialsRepository, UserRepository} from '../../../repositories';
import {AuthUser} from '../models/auth-user.model';

export class GoogleOauth2VerifyProvider
  implements Provider<VerifyFunction.GoogleAuthFn> {
  @inject('repositories.UserRepository', {optional: false})
  private userRepository: UserRepository;

  @inject('repositories.UserCredentialsRepository', {optional: false})
  private userCredsRepository: UserCredentialsRepository;
  constructor() {}

  value(): VerifyFunction.GoogleAuthFn {
    return async (accessToken: string, refreshToken: string, profile: any) => {
      const user = await this.userRepository.findOne({
        where: {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          email: (profile as any)._json.email,
        },
      });
      if (!user) {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
      }
      const creds = await this.userCredsRepository.findOne({
        where: {
          userId: user.id,
        },
      });
      if (
        !creds ||
        creds.authProvider !== 'google' ||
        creds.authId !== profile.id
      ) {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
      }

      const authUser: AuthUser = new AuthUser(user as any);
      authUser.permissions = [];
      authUser.externalAuthToken = accessToken;
      authUser.externalRefreshToken = refreshToken;
      authUser.tenant = new Tenant({id: user.defaultTenant});
      return authUser;
    };
  }
}
