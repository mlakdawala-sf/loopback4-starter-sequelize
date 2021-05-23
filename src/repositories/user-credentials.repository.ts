import {inject} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {AuthenticationBindings} from 'loopback4-authentication';
import {UserCredentials} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {DefaultSoftCrudRepository} from './default-soft-crud.repository.base';

export class UserCredentialsRepository extends DefaultSoftCrudRepository<UserCredentials> {
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(UserCredentials, getCurrentUser);
  }
}
