import {Tenant} from '../../../models';
import {IAuthUser} from '../../../types';

export class AuthUser implements IAuthUser {
  permissions: string[];
  role?: string;
  tenant?: Tenant;
  externalAuthToken?: string;
  externalRefreshToken?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  username: string;
  email?: string;
  phone?: string;
  defaultTenant: number;
  lastLogin?: Date;
  createdBy?: number;
  modifiedBy?: number;
  id?: number;
  createdOn?: Date;
  modifiedOn?: Date;
  deleted?: boolean;
  deletedOn?: Date;
  deletedBy?: number;
  constructor(data: Partial<AuthUser>) {
    Object.assign(this, data);
  }
}
