import {BelongsTo, Column, ForeignKey, Table} from 'sequelize-typescript';
import {BaseEntity, User} from '.';

@Table({
  tableName: 'user_credentials',
  schema: 'lbstarter',
})
export class UserCredentials extends BaseEntity {
  @ForeignKey(() => User)
  @Column({field: 'user_id'})
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    field: 'auth_provider',
  })
  authProvider: string;

  @Column({
    field: 'auth_id',
  })
  authId?: string;

  @Column({
    field: 'auth_token',
  })
  authToken?: string;

  @Column
  password?: string;
}
