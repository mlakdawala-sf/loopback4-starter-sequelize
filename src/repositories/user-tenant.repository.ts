import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AuthenticationBindings} from 'loopback4-authentication';
import {User, UserTenant} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {DefaultSoftCrudRepository} from './default-soft-crud.repository.base';
import {RoleRepository} from './role.repository';

export class UserTenantRepository extends DefaultSoftCrudRepository<UserTenant> {
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
    @repository(RoleRepository)
    public roleRepo: RoleRepository,
  ) {
    super(UserTenant, getCurrentUser);
  }
  async createByUser(user: User) {
    if (!user.id || !user.defaultTenant) {
      throw new HttpErrors.UnprocessableEntity(
        'User Id or Default Tenant Id is missing in the request parameters',
      );
    }
    const userTenant = new UserTenant();

    userTenant.userId = user.id;
    userTenant.tenantId = user.defaultTenant;

    const role = await this.roleRepo.findOne({
      where: {
        name: process.env.DEFAULT_ROLE,
      },
    });
    if (role?.id) {
      userTenant.roleId = role.id;
    } else {
      throw new HttpErrors.UnprocessableEntity('Failed to set default role.');
    }
    return super.create(userTenant);
  }
}
