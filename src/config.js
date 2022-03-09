"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class Config {
    constructor() {
        this.schema = null;
        this.customConfig = null;
        this.defaultConfig = null;
        this.errors = [];
        this.defaultConfig = {
            defaultFieldTypes: {
                string: {
                    validations: Object.assign({}, types_1.string),
                },
                number: {
                    validations: Object.assign({}, types_1.number),
                },
                date: {
                    validations: Object.assign({}, types_1.date),
                },
            },
        };
    }
    setCustomConfig(config) {
        this.customConfig = config;
    }
    getCustomConfig() {
        return this.customConfig;
    }
    setSchema(schema) {
        this.schema = schema;
    }
    getSchema() {
        return this.schema;
    }
    getSchemaField(fieldName) {
        var _a;
        return (_a = this.schema) === null || _a === void 0 ? void 0 : _a.fields[fieldName];
    }
    getDefaultConfig() {
        return this.defaultConfig;
    }
    getDefaultValidations(type) {
        var _a, _b;
        return (_b = (_a = this.defaultConfig.defaultFieldTypes[type]) === null || _a === void 0 ? void 0 : _a.validations) === null || _b === void 0 ? void 0 : _b.default;
    }
    getDefaultValidation(type, validationName) {
        var _a, _b;
        return (_b = (_a = this.defaultConfig.defaultFieldTypes[type]) === null || _a === void 0 ? void 0 : _a.validations) === null || _b === void 0 ? void 0 : _b.default[validationName];
    }
    getErrors() {
        return this.errors;
    }
    setError(newError) {
        const errorExists = this.errors.find(error => error.path === newError.path);
        if (errorExists) {
            this.errors = this.errors.map(error => {
                if (error.path === newError.path) {
                    return Object.assign({}, newError);
                }
                return error;
            });
        }
        else {
            this.errors.push(newError);
        }
    }
}
// let GlobalConfig = null;
// if (!GlobalConfig) {
//   GlobalConfig = new Config();
// }
exports.default = Config;
