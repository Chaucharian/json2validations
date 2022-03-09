"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maximum = exports.minimum = exports.isNumber = void 0;
const errors_1 = require("../errors");
const utils_1 = require("./utils");
const isNumber = (field, config) => {
    var _a;
    if (!(0, utils_1.hasToValidate)(field)) {
        return;
    }
    if (!Number(field.value)) {
        config.setError(new errors_1.ValidationError({
            path: field.key,
            message: (_a = (0, utils_1.getErrorMessage)(field, 'isNumber', config)) !== null && _a !== void 0 ? _a : `${field.key} must be a number received was ${field.value} `,
        }));
    }
};
exports.isNumber = isNumber;
const minimum = (field, criteria, config) => {
    var _a;
    if (!(0, utils_1.hasToValidate)(field)) {
        return;
    }
    if (field.value < criteria) {
        config.setError(new errors_1.ValidationError({
            path: field.key,
            message: (_a = (0, utils_1.getErrorMessage)(field, 'minimum', config)) !== null && _a !== void 0 ? _a : `${field.key} couldn't be less than ${criteria}`,
        }));
    }
};
exports.minimum = minimum;
const maximum = (field, criteria, config) => {
    var _a;
    if (!(0, utils_1.hasToValidate)(field)) {
        return;
    }
    if (field.value > criteria) {
        config.setError(new errors_1.ValidationError({
            path: field.key,
            message: (_a = (0, utils_1.getErrorMessage)(field, 'maximum', config)) !== null && _a !== void 0 ? _a : `${field.key} couldn't be greater than ${criteria}`,
        }));
    }
};
exports.maximum = maximum;
