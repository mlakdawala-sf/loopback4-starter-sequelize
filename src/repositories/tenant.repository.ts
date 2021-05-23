import {Getter, inject} from '@loopback/core';
import {AuthenticationBindings} from 'loopback4-authentication';
import {Tenant} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {DefaultUserModifyCrudRepository} from './default-user-modify-crud.repository.base';

export class TenantRepository extends DefaultUserModifyCrudRepository<Tenant> {
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(Tenant, getCurrentUser);
  }
}
