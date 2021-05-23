import {Getter, inject} from '@loopback/core';
import {AuthenticationBindings} from 'loopback4-authentication';
import {Role} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {DefaultSoftCrudRepository} from './default-soft-crud.repository.base';

export class RoleRepository extends DefaultSoftCrudRepository<Role> {
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(Role, getCurrentUser);
  }
}
