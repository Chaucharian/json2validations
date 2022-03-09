"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patterns = exports.minLength = exports.maxLength = exports.isString = void 0;
const errors_1 = require("../errors");
const utils_1 = require("./utils");
const isOptionalWithValue = field => !field.required && field.value;
const isRequired = field => field.required && field.value === '';
const hasToValidate = field => isOptionalWithValue(field) || isRequired(field);
const isString = (field, config) => {
    var _a;
    if (!hasToValidate(field)) {
        return;
    }
    if (!String(field.value)) {
        config.setError(new errors_1.ValidationError({
            path: field.key,
            message: (_a = (0, utils_1.getErrorMessage)(field, 'isString', config)) !== null && _a !== void 0 ? _a : `${field.key} must be a string`,
        }));
    }
};
exports.isString = isString;
const maxLength = (field, criteria, config) => {
    if (!hasToValidate(field)) {
        return;
    }
    if (field.value.length > criteria) {
        config.setError(new errors_1.ValidationError({
            path: field.key,
            message: `${field.key} max length of ${criteria} exceded`,
        }));
    }
};
exports.maxLength = maxLength;
const minLength = (field, criteria, config) => {
    if (!hasToValidate(field)) {
        return;
    }
    if (field.value.length < criteria) {
        config.setError(new errors_1.ValidationError({
            path: field.key,
            message: `${field.key} couldn't be less than ${criteria}`,
        }));
    }
};
exports.minLength = minLength;
const PATTERNS = {
    onlyLetters: (field, config) => {
        if (!hasToValidate(field)) {
            return;
        }
        if (!field.value.match(/^([^0-9]*)$/)) {
            config.setError(new errors_1.ValidationError({
                path: field.key,
                message: 'only letters allowed',
            }));
        }
    },
};
// only patterns names (i.e onlyLetters) and regExs are accepted
const patterns = (field, schemaPatterns, config) => {
    if (!hasToValidate(field)) {
        return;
    }
    schemaPatterns === null || schemaPatterns === void 0 ? void 0 : schemaPatterns.forEach((pattern) => {
        var _a, _b, _c, _d, _e;
        if (typeof pattern !== 'string' && typeof pattern !== 'object') {
            console.warn('custom pattern name or regEx is expected');
            return;
        }
        if (typeof pattern === 'string') {
            // get user config and search custom pattern first if not found look for default
            const customPatterns = (_e = (_d = (_c = (_b = (_a = config.getCustomConfig()) === null || _a === void 0 ? void 0 : _a.defaultFieldTypes) === null || _b === void 0 ? void 0 : _b.string) === null || _c === void 0 ? void 0 : _c.validations) === null || _d === void 0 ? void 0 : _d.patterns) !== null && _e !== void 0 ? _e : {};
            if (customPatterns[pattern]) {
                customPatterns[pattern](field, config);
            }
            else if (PATTERNS[pattern]) {
                PATTERNS[pattern](field, config);
            }
            else {
                throw new errors_1.SchemaError(`pattern ${pattern} not found`);
            }
        }
        if (typeof pattern === 'object') {
            if (!field.value.match(pattern)) {
                config.setError(new errors_1.ValidationError({
                    path: field.key,
                    message: `${field.key} doesn't meet pattern criteria`,
                }));
            }
        }
    });
};
exports.patterns = patterns;
