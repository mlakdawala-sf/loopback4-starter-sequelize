// import {model, Column} from '@loopback/repository';

import {Column, HasMany, Table} from 'sequelize-typescript';
import {TenantType} from '../enums/tenant-type.enum';
import {UserModifiableEntity} from './user-modifiable-entity.model';
import {UserTenant} from './user-tenant.model';
// import {TenantType} from '../modules/user-tenants/tenant-type.enum';

@Table({
  tableName: 'tenants',
  schema: 'lbstarter',
})
export class Tenant extends UserModifiableEntity {
  @Column
  name: string;

  @Column
  type: TenantType;

  @Column({
    allowNull: true,
  })
  address1?: string;

  @Column({
    allowNull: true,
  })
  address2?: string;

  @Column({
    allowNull: true,
  })
  address3?: string;

  @Column({
    allowNull: true,
  })
  address4?: string;

  @Column({
    allowNull: true,
  })
  city?: string;

  @Column({
    allowNull: true,
  })
  state?: string;

  @Column({
    allowNull: true,
  })
  zip?: string;

  @Column({
    allowNull: true,
  })
  country?: string;

  @Column({
    defaultValue: 'active',
  })
  status: string;

  @HasMany(() => UserTenant)
  userTenants: UserTenant;

  constructor(data?: Partial<Tenant>) {
    super(data);
  }
}
