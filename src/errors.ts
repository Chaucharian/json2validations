class CustomError extends Error {
  public date: Date;

  constructor(error: { name: string; type: string }, ...params: any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    this.name = error.name ?? 'CustomError';
    // Custom debugging information
    this.date = new Date();
  }
}

export class SchemaTypeNotFound extends CustomError {
  public path: string;
  constructor(message: string, path: string) {
    super({ name: 'SchemaTypeNotFound' }, message);
    this.path = path;
  }
}

export class SchemaError extends CustomError {
  constructor(message: string) {
    super({ name: 'SchemaError', type: 'Schema' }, message);
  }
}

export interface Validation {
  [k: string]: (fn: CommonValidationParams) => void;
}

export interface Field {
  [k: string]: any;
}

export interface FormErrorData {
  path: string;
  message: string;
  type?: string;
}
export class FormErrors extends Error {
  inner: FormErrorData[];
  constructor(errors: FormErrorData[]) {
    super(errors.map(({ message }) => message).join('. '));
    this.inner = errors;
  }
}

enum ErrorTypes {
  ValidationError = 'ValidationError',
}
export class ValidationError extends Error {
  public error: FormErrorData;
  public path: string;
  public type: string;
  constructor(error: FormErrorData, ...args) {
    super(...args);
    this.type = ErrorTypes.ValidationError;
    this.path = error.path;
    this.message = error.message;
  }
}
