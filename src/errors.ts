import Config from "./config";
class CustomError extends Error {
  public date: Date;

  constructor(error: { name: string }, ...params: any) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    this.name = error.name ?? "CustomError";
    // Custom debugging information
    this.date = new Date();
  }
}

export class ValidationError extends CustomError {
  public path: string;
  public type: string;
  constructor(error: FormError, ...args) {
    super({ name: "FormError" }, ...args);
    this.type = ErrorTypes.ValidationError;
    this.path = error.path;
    this.message = error.message;
  }
}
export class SchemaTypeNotFound extends CustomError {
  public path: string;
  constructor(message: string, path: string) {
    super({ name: "SchemaTypeNotFound" }, message);
    this.path = path;
  }
}

export class SchemaError extends CustomError {
  constructor(message: string) {
    super({ name: "SchemaError" }, message);
  }
}

export interface CommonValidationParams {
  field: Field;
  config: Config;
}

export interface Validation {
  [k: string]: (args: CommonValidationParams) => void;
}

export interface Field {
  [k: string]: any;
}

export interface FormError {
  path: string;
  message: string;
  type?: string;
}
export class FormErrors extends Error {
  inner: FormError[];
  constructor(errors: FormError[]) {
    super(errors.map(({ message }) => message).join(". "));
    this.inner = errors;
  }
}

enum ErrorTypes {
  ValidationError = "ValidationError",
}
