"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDate = void 0;
const date_fns_1 = require("date-fns");
const errors_1 = require("../errors");
const utils_1 = require("./utils");
const isDate = (field, config) => {
    if (!(0, utils_1.hasToValidate)(field)) {
        return;
    }
    if (!(0, date_fns_1.isValid)(field.value)) {
        config.setError(new errors_1.ValidationError({
            path: field.key,
            message: `${field.key} must be a valid Date recived value was ${field.value}`,
        }));
    }
};
exports.isDate = isDate;
