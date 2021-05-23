import {Getter, inject} from '@loopback/core';
import {AuthenticationBindings} from 'loopback4-authentication';
import {UserTenantPermission} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {DefaultUserModifyCrudRepository} from './default-user-modify-crud.repository.base';

export class UserTenantPermissionRepository extends DefaultUserModifyCrudRepository<UserTenantPermission> {
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(UserTenantPermission, getCurrentUser);
  }
}
