import {Column, DataType, HasMany, Table} from 'sequelize-typescript';
import {RoleType} from '../enums/role.enum';
import {BaseEntity} from './base-entity.model';
import {UserTenant} from './user-tenant.model';

@Table({
  tableName: 'roles',
  schema: 'lbstarter',
})
export class Role extends BaseEntity {
  @Column
  name: string;

  @Column({type: DataType.ARRAY(DataType.STRING)})
  permissions: string[];

  @Column({
    // type: DataType.ENUM,
    field: 'role_key',
  })
  roleKey: RoleType;

  @HasMany(() => UserTenant)
  userTenants: UserTenant;
}
