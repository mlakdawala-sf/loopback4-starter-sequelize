import {AuditLog} from '../models';
import {DefaultCrudRepository} from './default-crud.repository';

export class AuditLogRepository extends DefaultCrudRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }
}
