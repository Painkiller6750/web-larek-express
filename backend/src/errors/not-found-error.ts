import { ApiError } from './api-error';

export class NotFoundError extends ApiError {
  constructor(message = 'Ресурс не найден') {
    super(404, message);
  }
}
