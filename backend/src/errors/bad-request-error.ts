import { ApiError } from './api-error';

export class BadRequestError extends ApiError {
  constructor(message = 'Некорректные данные') {
    super(400, message);
  }
}
