import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {VerifyFunction} from 'loopback4-authentication';
import {AuthUser} from '..';
import {Tenant} from '../../../models';
import {UserRepository} from '../../../repositories';

export class LocalPasswordVerifyProvider
  implements Provider<VerifyFunction.LocalPasswordFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  value(): VerifyFunction.LocalPasswordFn {
    return async (username: string, password: string) => {
      const dbUser = await this.userRepository.verifyPassword(
        username,
        password,
      );
      const user: AuthUser = new AuthUser(dbUser.toJSON());
      user.permissions = [];
      user.tenant = new Tenant({id: user.defaultTenant});
      return user;
    };
  }
}
