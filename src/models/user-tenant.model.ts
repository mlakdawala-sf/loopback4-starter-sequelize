import {BelongsTo, Column, ForeignKey, Table} from 'sequelize-typescript';
import {BaseEntity, Role, Tenant, User} from '.';

@Table({
  tableName: 'user_tenants',
  schema: 'lbstarter',
})
export class UserTenant extends BaseEntity {
  @ForeignKey(() => User)
  @Column({field: 'user_id'})
  userId: number;

  @BelongsTo(() => User, 'id')
  user: User;

  @ForeignKey(() => Tenant)
  @Column({field: 'tenant_id'})
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => Role)
  @Column({field: 'role_id'})
  roleId: number;

  @BelongsTo(() => Role)
  role: Role;

  @Column({
    defaultValue: 'active',
  })
  status: string;
}
