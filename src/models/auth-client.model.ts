import {Column, DataType, Table} from 'sequelize-typescript';
import {IAuthClient} from '../types';
import {BaseEntity} from './base-entity.model';

@Table({
  tableName: 'auth_clients',
  schema: 'lbstarter',
})
export class AuthClient extends BaseEntity implements IAuthClient {
  @Column({
    field: 'client_id',
  })
  clientId: string;

  @Column({
    field: 'client_secret',
  })
  clientSecret: string;

  @Column
  secret: string;

  @Column({
    field: 'redirect_url',
  })
  redirectUrl?: string;

  @Column({
    // type: DataType.ARRAY(DataType.STRING),
    field: 'user_ids',
  })
  userIds: string;

  @Column({
    type: DataType.NUMBER,
    field: 'access_token_expiration',
  })
  accessTokenExpiration: number;

  @Column({
    type: DataType.NUMBER,
    field: 'refresh_token_expiration',
  })
  refreshTokenExpiration: number;

  @Column({
    type: DataType.NUMBER,
    field: 'auth_code_expiration',
  })
  authCodeExpiration: number;

  constructor(data?: Partial<AuthClient>) {
    super(data);
  }
}
