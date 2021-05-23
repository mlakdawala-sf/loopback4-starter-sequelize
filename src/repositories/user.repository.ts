import {Getter, inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import * as bcrypt from 'bcrypt';
import {AuthenticationBindings, AuthErrorKeys} from 'loopback4-authentication';
import {AuthenticateErrorKeys} from '../enums/error-keys';
import {User, UserCredentials} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {DefaultUserModifyCrudRepository} from './default-user-modify-crud.repository.base';
import {UserCredentialsRepository} from './user-credentials.repository';

export class UserRepository extends DefaultUserModifyCrudRepository<User> {
  @inject('repositories.UserCredentialsRepository', {optional: false})
  private credentialRepo: UserCredentialsRepository;
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(User, getCurrentUser);
  }

  private readonly saltRounds = 10;

  async create(entity: Partial<User>): Promise<User> {
    try {
      const user = await super.create(entity);

      // Add temporary password for first time
      const password = await bcrypt.hash(
        process.env.USER_TEMP_PASSWORD,
        this.saltRounds,
      );

      await this.credentialRepo.create({
        authProvider: 'internal',
        password: password,
        userId: user.id,
      });
      return user as any;
    } catch (err) {
      console.log(err);

      throw new HttpErrors.UnprocessableEntity('Error while hashing password');
    }
  }

  async verifyPassword(username: string, password: string): Promise<User> {
    const user = await super.findOne({
      where: {username},
      include: [UserCredentials],
    });
    if (!user || user?.deleted || !user.credentials?.password) {
      throw new HttpErrors.Unauthorized(AuthenticateErrorKeys.UserDoesNotExist);
    } else if (!(await bcrypt.compare(password, user.credentials.password))) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
    } else if (
      await bcrypt.compare(password, process.env.USER_TEMP_PASSWORD!)
    ) {
      throw new HttpErrors.Forbidden(
        AuthenticateErrorKeys.TempPasswordLoginDisallowed,
      );
    }
    return user;
  }

  async updatePassword(
    username: string,
    password: string,
    newPassword: string,
  ): Promise<User> {
    const user = await super.findOne({
      where: {username},
      include: [UserCredentials],
    });
    const creds = user?.credentials;
    if (!user || user.deleted || !creds || !creds.password) {
      throw new HttpErrors.Unauthorized(AuthenticateErrorKeys.UserDoesNotExist);
    } else if (!(await bcrypt.compare(password, creds.password))) {
      throw new HttpErrors.Unauthorized(AuthErrorKeys.WrongPassword);
    } else if (await bcrypt.compare(newPassword, creds.password)) {
      throw new HttpErrors.Unauthorized(
        'Password cannot be same as previous password!',
      );
    }
    await this.credentialRepo.update(
      {
        password: await bcrypt.hash(newPassword, this.saltRounds),
      },
      {where: {id: user.id}},
    );
    return user;
  }
}
