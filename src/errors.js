"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.FormErrors = exports.SchemaError = exports.SchemaTypeNotFound = void 0;
class CustomError extends Error {
    constructor(error, ...params) {
        var _a;
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);
        this.name = (_a = error.name) !== null && _a !== void 0 ? _a : 'CustomError';
        // Custom debugging information
        this.date = new Date();
    }
}
class SchemaTypeNotFound extends CustomError {
    constructor(message, path) {
        super({ name: 'SchemaTypeNotFound' }, message);
        this.path = path;
    }
}
exports.SchemaTypeNotFound = SchemaTypeNotFound;
class SchemaError extends CustomError {
    constructor(message) {
        super({ name: 'SchemaError', type: 'Schema' }, message);
    }
}
exports.SchemaError = SchemaError;
class FormErrors extends Error {
    constructor(errors) {
        super(errors.map(({ message }) => message).join('. '));
        this.inner = errors;
    }
}
exports.FormErrors = FormErrors;
var ErrorTypes;
(function (ErrorTypes) {
    ErrorTypes["ValidationError"] = "ValidationError";
})(ErrorTypes || (ErrorTypes = {}));
class ValidationError extends Error {
    constructor(error, ...args) {
        super(...args);
        this.type = ErrorTypes.ValidationError;
        this.path = error.path;
        this.message = error.message;
    }
}
exports.ValidationError = ValidationError;
