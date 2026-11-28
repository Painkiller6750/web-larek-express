import ApiError from './api-error';

class BadRequestError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}

export default BadRequestError;
