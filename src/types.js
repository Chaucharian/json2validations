"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.date = exports.boolean = exports.string = exports.number = void 0;
const string_1 = require("./validations/string");
const number_1 = require("./validations/number");
const date_1 = require("./validations/date");
exports.number = {
    basic: {
        isNumber: number_1.isNumber,
    },
    default: {
        minimum: number_1.minimum,
        maximum: number_1.maximum,
    },
};
exports.string = {
    basic: {
        isString: string_1.isString,
    },
    default: {
        maxLength: string_1.maxLength,
        minLength: string_1.minLength,
        patterns: string_1.patterns,
    },
};
exports.boolean = {};
exports.date = {
    basic: {
        isDate: date_1.isDate,
    },
    default: {
        isDate: date_1.isDate,
    },
};
