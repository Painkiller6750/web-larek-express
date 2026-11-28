import ApiError from './api-error';

class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super(401, message);
  }
}

export default UnauthorizedError;
