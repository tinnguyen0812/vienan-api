import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;
    const detail = (exception as any).detail;

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };

    // Postgres error codes
    const code = (exception as any).code;

    if (code === '23505') {
      // Unique violation
      status = HttpStatus.CONFLICT;
      errorResponse = {
        statusCode: status,
        message: detail || 'Unique constraint violation',
        error: 'Conflict',
      };
    } else if (code === '23503') {
      // Foreign key violation
      status = HttpStatus.BAD_REQUEST;
      errorResponse = {
        statusCode: status,
        message: detail || 'Foreign key constraint violation',
        error: 'Bad Request',
      };
    } else if (code === '23502') {
      // Not null violation
      status = HttpStatus.BAD_REQUEST;
      errorResponse = {
        statusCode: status,
        message: detail || 'Not null constraint violation',
        error: 'Bad Request',
      };
    }

    response.status(status).json(errorResponse);
  }
}
