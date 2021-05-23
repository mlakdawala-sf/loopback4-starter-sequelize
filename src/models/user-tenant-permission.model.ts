import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import {UserPermission} from '../types';
import {UserModifiableEntity} from './user-modifiable-entity.model';
import {UserTenant} from './user-tenant.model';

@Table({
  tableName: 'user_tenant_permissions',
  schema: 'lbstarter',
})
export class UserTenantPermission
  extends UserModifiableEntity
  implements UserPermission<string> {
  @ForeignKey(() => UserTenant)
  @Column({field: 'user_tenant_id'})
  userTenantId: number;

  @BelongsTo(() => UserTenant)
  userTenant: UserTenant;

  @Column
  permission: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  allowed: boolean;

  constructor(data?: Partial<UserTenantPermission>) {
    super(data);
  }
}
