"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const errors_1 = require("../errors");
const main_1 = __importDefault(require("../main"));
describe('Internal build flow', () => {
    test('should throw an error cause custom validation on JSON schema was not found on config object', () => {
        const config = {
            defaultFieldTypes: {
                string: {
                    validations: {
                        extends: {
                            maxThan100: () => {
                                // dummy validation
                            },
                        },
                    },
                },
            },
        };
        const fields = {
            stringField: '01/01/2007',
        };
        const schema = {
            fields: {
                stringField: {
                    type: 'string',
                    validations: {
                        extends: ['THIS_VALIDATION_IS_MISSING'],
                    },
                },
            },
        };
        expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
    });
    test('should pass cause custom validation on JSON schema was found on config object', () => {
        const config = {
            defaultFieldTypes: {
                string: {
                    validations: {
                        extends: {
                            maxThan100: () => {
                                // dummy validation
                            },
                        },
                    },
                },
            },
        };
        const fields = {
            stringField: '01/01/2007',
        };
        const schema = {
            fields: {
                stringField: {
                    type: 'string',
                    validations: {
                        extends: ['maxThan100'],
                    },
                },
            },
        };
        const values = (0, main_1.default)(schema, fields, config);
        expect(values).toMatchObject(fields);
    });
});
describe('Custom date validations', () => {
    describe('older than 18 years', () => {
        test('should throw an error by invalid date', () => {
            const config = {
                defaultFieldTypes: {
                    date: {
                        validations: {
                            extends: {
                                olderThan18: field => {
                                    if ((0, date_fns_1.differenceInCalendarYears)(new Date(), field.value) < 18) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must be at least 18 years from current date`,
                                        });
                                    }
                                },
                            },
                        },
                        transformations: {
                            before: [
                                value => {
                                    return (0, date_fns_1.parse)(value, 'P', new Date(), {
                                        locale: locale_1.enUS,
                                    });
                                },
                            ],
                        },
                    },
                },
            };
            const fields = {
                dateField: '01/01/2007',
            };
            const schema = {
                fields: {
                    dateField: {
                        type: 'date',
                        validations: {
                            extends: ['olderThan18'],
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass validation by valid date', () => {
            const config = {
                defaultFieldTypes: {
                    date: {
                        validations: {
                            extends: {
                                olderThan18: field => {
                                    if ((0, date_fns_1.differenceInCalendarYears)(new Date(), field.value) < 18) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must be at least 18 years from current date`,
                                        });
                                    }
                                },
                            },
                        },
                        transformations: {
                            before: [
                                value => {
                                    return (0, date_fns_1.parse)(value, 'P', new Date(), {
                                        locale: locale_1.enUS,
                                    });
                                },
                            ],
                        },
                    },
                },
            };
            const fields = {
                dateField: '01/01/2000',
            };
            const schema = {
                fields: {
                    dateField: {
                        type: 'date',
                        validations: {
                            extends: ['olderThan18'],
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            const expectedDate = (0, date_fns_1.parse)('01/01/2000', 'P', new Date(), {
                locale: locale_1.enUS,
            });
            expect(values).toMatchObject({
                dateField: expectedDate,
            });
        });
    });
    describe('not today', () => {
        test('should throw an error by invalid date', () => {
            const config = {
                defaultFieldTypes: {
                    date: {
                        validations: {
                            extends: {
                                notToday: field => {
                                    if ((0, date_fns_1.isToday)(field.value)) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must not be today`,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
            const fields = {
                dateField: new Date(),
            };
            const schema = {
                fields: {
                    dateField: {
                        type: 'date',
                        validations: {
                            extends: ['notToday'],
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass validation by valid date', () => {
            const config = {
                defaultFieldTypes: {
                    date: {
                        validations: {
                            extends: {
                                notToday: field => {
                                    if ((0, date_fns_1.isToday)(field.value)) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must not be today`,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
            const dateField = (0, date_fns_1.addDays)(new Date(), 1);
            const fields = {
                dateField,
            };
            const schema = {
                fields: {
                    dateField: {
                        type: 'date',
                        validations: {
                            extends: ['notToday'],
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            expect(values).toMatchObject({ dateField });
        });
    });
    describe('not this month and year', () => {
        test('should throw an error cause date its current month', () => {
            const config = {
                defaultFieldTypes: {
                    date: {
                        validations: {
                            extends: {
                                notThisMonthAndYear: field => {
                                    if ((0, date_fns_1.isThisMonth)(field.value) && (0, date_fns_1.isThisYear)(field.value)) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must not be this month and year`,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
            const fields = {
                dateField: new Date(),
            };
            const schema = {
                fields: {
                    dateField: {
                        type: 'date',
                        validations: {
                            extends: ['notThisMonthAndYear'],
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass validation cause date its 1 month ahead', () => {
            const config = {
                defaultFieldTypes: {
                    date: {
                        validations: {
                            extends: {
                                notThisMonthAndYear: field => {
                                    if ((0, date_fns_1.isThisMonth)(field.value) && (0, date_fns_1.isThisYear)(field.value)) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must not be this month and year`,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
            const dateField = (0, date_fns_1.addMonths)(new Date(), 1);
            const fields = {
                dateField,
            };
            const schema = {
                fields: {
                    dateField: {
                        type: 'date',
                        validations: {
                            extends: ['notThisMonthAndYear'],
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            expect(values).toMatchObject({ dateField });
        });
    });
    describe('should use multiple custom validations', () => {
        test('should throw an error cause date not match validations', () => {
            const config = {
                defaultFieldTypes: {
                    date: {
                        validations: {
                            extends: {
                                notThisMonthAndYear: field => {
                                    if ((0, date_fns_1.isThisMonth)(field.value) && (0, date_fns_1.isThisYear)(field.value)) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must not be this month and year`,
                                        });
                                    }
                                },
                                olderThan18: field => {
                                    if ((0, date_fns_1.differenceInCalendarYears)(new Date(), field.value) < 18) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must be at least 18 years from current date`,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
            const fields = {
                dateField: new Date(),
            };
            const schema = {
                fields: {
                    dateField: {
                        type: 'date',
                        validations: {
                            extends: ['notThisMonthAndYear', 'olderThan18'],
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
    });
});
describe('Custom string validations', () => {
    describe('should use patterns', () => {
        test('should throw an error using custom pattern', () => {
            const config = {
                defaultFieldTypes: {
                    string: {
                        validations: {
                            patterns: {
                                onlyNumbers: field => {
                                    if (!Number(field.value)) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must not be today`,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
            const fields = {
                stringField: 'a123',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                patterns: ['onlyNumbers'],
                            },
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass pattern', () => {
            const config = {
                defaultFieldTypes: {
                    string: {
                        validations: {
                            patterns: {
                                onlyNumbers: field => {
                                    if (!Number(field.value)) {
                                        throw new errors_1.ValidationError({
                                            path: field.key,
                                            message: `${field.key} must not be today`,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
            const fields = {
                stringField: '123',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                patterns: ['onlyNumbers'],
                            },
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            expect(values).toMatchObject(fields);
        });
        test('should throw an error cause pattern was not found', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'a123',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                patterns: ['onlyNumbers'],
                            },
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
    });
});
describe('Default string validations', () => {
    describe('maxLength', () => {
        test('should throw an error cause field is longer than expected', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this is longer than 10',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                maxLength: 10,
                            },
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass validation cause field is shorter as expected', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this is less than 20',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                maxLength: 20,
                            },
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            expect(values).toMatchObject(fields);
        });
    });
    describe('onlyLetters', () => {
        test('should throw an error cause field contains numbers', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this string has numbers 123',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                patterns: ['onlyLetters'],
                            },
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass validation cause field not contain numbers', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this string not has numbers',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                patterns: ['onlyLetters'],
                            },
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            expect(values).toMatchObject(fields);
        });
    });
});
describe('Multiple fields some required and not other', () => {
    describe('maxLength', () => {
        test('should throw an error cause field is longer than expected', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this is longer than 10',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                maxLength: 10,
                            },
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass validation cause field is shorter as expected', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this is less than 20',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                maxLength: 20,
                            },
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            expect(values).toMatchObject(fields);
        });
    });
    describe('onlyLetters', () => {
        test('should throw an error cause field contains numbers', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this string has numbers 123',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                patterns: ['onlyLetters'],
                            },
                        },
                    },
                },
            };
            expect(() => (0, main_1.default)(schema, fields, config)).toThrowError();
        });
        test('should pass validation cause field not contain numbers', () => {
            const config = {
                defaultFieldTypes: {},
            };
            const fields = {
                stringField: 'this string has numbers',
            };
            const schema = {
                fields: {
                    stringField: {
                        type: 'string',
                        validations: {
                            default: {
                                onlyLetters: true,
                            },
                        },
                    },
                },
            };
            const values = (0, main_1.default)(schema, fields, config);
            expect(values).toMatchObject(fields);
        });
    });
});
