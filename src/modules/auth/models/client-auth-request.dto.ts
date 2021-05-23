import {Model, model, property} from '@loopback/repository';

@model()
export class ClientAuthRequest extends Model {
  @property({
    type: 'string',
    required: true,
  })
  clientId: string;

  @property({
    type: 'string',
    required: true,
  })
  clientSecret: string;

  constructor(data?: Partial<ClientAuthRequest>) {
    super(data);
  }
}
