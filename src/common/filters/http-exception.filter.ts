import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;
    let stack: string | undefined;

    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        error = responseObj.error || error;
        details = responseObj.details || null;
      }

      if (isDevelopment) {
        stack = exception.stack;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      if (isDevelopment) {
        stack = exception.stack;
      }

      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Unknown exception type', exception);
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    if (details) {
      errorResponse.details = details;
    }

    if (isDevelopment && stack) {
      errorResponse.stack = stack;
    }

    response.status(status).json(errorResponse);
  }
}

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Validation failed';
    let errors: any[] = [];

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || message;
      
      if (responseObj.message && Array.isArray(responseObj.message)) {
        errors = responseObj.message.map((msg: string) => ({
          field: this.extractFieldFromMessage(msg),
          message: msg,
        }));
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: 'Validation Error',
      errors,
    };

    this.logger.warn(`Validation error: ${message}`, errors);

    response.status(status).json(errorResponse);
  }

  private extractFieldFromMessage(message: string): string {
    const match = message.match(/^(\w+)/);
    return match ? match[1] : 'unknown';
  }
}

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';
    let error = 'Database Error';

    if (this.isDatabaseError(exception)) {
      const dbError = exception as any;
      
      switch (dbError.code) {
        case '23505':
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          error = 'Duplicate Entry';
          break;
        case '23503':
          status = HttpStatus.BAD_REQUEST;
          message = 'Referenced resource does not exist';
          error = 'Foreign Key Violation';
          break;
        case '23502':
          status = HttpStatus.BAD_REQUEST;
          message = 'Required field is missing';
          error = 'Not Null Violation';
          break;
        case '23514':
          status = HttpStatus.BAD_REQUEST;
          message = 'Data violates constraint';
          error = 'Check Constraint Violation';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database operation failed';
          error = 'Database Error';
      }

      this.logger.error(`Database error: ${dbError.message}`, dbError.detail || dbError.stack);
    } else {
      this.logger.error('Unknown database error', exception);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    response.status(status).json(errorResponse);
  }

  private isDatabaseError(exception: unknown): boolean {
    if (typeof exception === 'object' && exception !== null) {
      const error = exception as any;
      return (
        error.code ||
        error.driverError ||
        error.query ||
        error.parameters
      );
    }
    return false;
  }
}
