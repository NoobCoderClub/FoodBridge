import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

interface PostgresError extends Error {
  code?: string;
}

// Maps common Postgres error codes to HTTP status codes so a raw DB error
// never surfaces as an unhandled 500.
const PG_ERROR_STATUS: Record<string, HttpStatus> = {
  '23505': HttpStatus.CONFLICT, // unique_violation
  '23503': HttpStatus.BAD_REQUEST, // foreign_key_violation
  '23514': HttpStatus.BAD_REQUEST, // check_violation
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body, error: exception.name }
            : { statusCode: status, ...body },
        );
      return;
    }

    const pgError = exception as PostgresError;
    const status =
      (pgError.code ? PG_ERROR_STATUS[pgError.code] : undefined) ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : pgError.message,
      error: pgError.name ?? 'Error',
    });
  }
}
