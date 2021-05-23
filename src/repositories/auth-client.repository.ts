import {Getter, inject} from '@loopback/core';
import {AuthenticationBindings} from 'loopback4-authentication';
import {AuthClient} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {DefaultSoftCrudRepository} from './default-soft-crud.repository.base';

export class AuthClientRepository extends DefaultSoftCrudRepository<AuthClient> {
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(AuthClient, getCurrentUser);
  }
}
