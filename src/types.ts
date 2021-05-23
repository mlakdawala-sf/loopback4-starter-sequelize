export interface IAuthUser {
  id?: number;
  username: string;
  password?: string;
  defaultTenant: number;
}
export interface UserPermission<T> {
  permission: T;
  allowed: boolean;
}
export interface IAuthClient {
  clientId: string;
  clientSecret: string;
  redirectUrl?: string;
}
