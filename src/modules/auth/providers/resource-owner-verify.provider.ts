import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AuthErrorKeys, VerifyFunction} from 'loopback4-authentication';
import {AuthClientRepository, UserRepository} from '../../../repositories';

export class ResourceOwnerVerifyProvider
  implements Provider<VerifyFunction.ResourceOwnerPasswordFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
  ) {}

  value(): VerifyFunction.ResourceOwnerPasswordFn {
    return async (clientId, clientSecret, username, password) => {
      const user = await this.userRepository.verifyPassword(username, password);
      if (!user) {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
      }
      const client = await this.authClientRepository.findOne({
        where: {
          clientId,
        },
      });
      if (!client || client.userIds.indexOf(`${user.id}`) < 0) {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.ClientInvalid);
      } else if (!client.clientSecret || client.clientSecret !== clientSecret) {
        throw new HttpErrors.Unauthorized(
          AuthErrorKeys.ClientVerificationFailed,
        );
      }
      return {
        client,
        user,
      };
    };
  }
}
