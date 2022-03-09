"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = exports.hasToValidate = void 0;
const isOptionalWithValue = field => !field.required && field.value;
const isRequired = field => field.required;
const hasToValidate = field => isOptionalWithValue(field) || isRequired(field);
exports.hasToValidate = hasToValidate;
const getErrorMessage = (field, errorName, config) => {
    var _a, _b;
    let message = undefined;
    if ((_a = config.getSchemaField(field.key)) === null || _a === void 0 ? void 0 : _a.errorMessages) {
        message = (_b = config.getSchemaField(field.key)) === null || _b === void 0 ? void 0 : _b.errorMessages[errorName];
    }
    return message;
};
exports.getErrorMessage = getErrorMessage;
