export class PublicApiError extends Error {
  readonly code: string;

  constructor(message: string, code = 'UNKNOWN') {
    super(message);
    this.name = 'PublicApiError';
    this.code = code;
  }
}

export function isPublicApiError(error: unknown): error is PublicApiError {
  return error instanceof PublicApiError;
}
