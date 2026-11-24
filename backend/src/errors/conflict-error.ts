import { ApiError } from './api-error';

export class ConflictError extends ApiError {
  constructor(message = 'Конфликт данных') {
    super(409, message);
  }
}
