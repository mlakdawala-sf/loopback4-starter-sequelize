import {Column, DataType, HasOne, Table} from 'sequelize-typescript';
import {IAuthUser} from '../types';
import {UserCredentials} from './user-credentials.model';
import {UserModifiableEntity} from './user-modifiable-entity.model';
import {UserTenant} from './user-tenant.model';
console.log('DB_SCHEMA');
console.log(process.env.NODE_ENV);

@Table({
  tableName: 'users',
  schema: 'lbstarter',
})
export class User extends UserModifiableEntity implements IAuthUser {
  @Column({field: 'first_name'})
  firstName: string;

  @Column({field: 'last_name'})
  lastName: string;

  @Column({allowNull: true, field: 'middle_name'})
  middleName?: string;

  @Column
  username: string;

  @Column
  email?: string;

  @Column
  phone?: string;

  @Column({field: 'default_tenant'})
  defaultTenant: number;

  @Column({type: DataType.DATE, allowNull: true, field: 'last_login'})
  lastLogin?: Date;

  @HasOne(() => UserCredentials)
  credentials: UserCredentials;

  @HasOne(() => UserTenant)
  userTenant: UserTenant;
}
