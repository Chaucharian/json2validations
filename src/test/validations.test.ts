import {
  isToday,
  isThisMonth,
  isThisYear,
  differenceInCalendarYears,
  parse,
  addDays,
  addMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { FormErrors, SchemaError, ValidationError } from "../errors";
import { buildSchema } from "../main";
import { currencyFormat, currencyToNumber } from "./helpers";

describe("Internal build flow", () => {
  test("should throw an error cause custom validation on JSON schema was not found on config object", () => {
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
      stringField: "01/01/2007",
    };
    const schema = {
      fields: {
        stringField: {
          type: "string",
          validations: {
            extends: ["THIS_VALIDATION_IS_MISSING"],
          },
        },
      },
    };
    expect(() => buildSchema(schema, fields, config)).toThrowError();
  });
  test("should pass cause custom validation on JSON schema was found on config object", () => {
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
      stringField: "01/01/2007",
    };
    const schema = {
      fields: {
        stringField: {
          type: "string",
          validations: {
            extends: ["maxThan100"],
          },
        },
      },
    };
    const values = buildSchema(schema, fields, config);
    expect(values).toMatchObject(fields);
  });
});

describe("Create custom type", () => {
  describe("must create a new type called currency and run inherited validations from number", () => {
    test("should run a transformation and native validation", () => {
      const config = {
        defaultFieldTypes: {
          currency: {
            from: "number",
            validations: {},
            transformations: {
              after: [currencyFormat],
            },
          },
        },
      };
      const fields = {
        currencyField: 4,
      };
      const schema = {
        fields: {
          currencyField: {
            required: true,
            type: "currency",
            validations: {
              default: {
                maximum: 5,
              },
            },
          },
        },
      };

      const values = buildSchema(schema, fields, config);
      expect(values).toMatchObject({
        currencyField: "$4.00",
      });
    });
    test("should throw a FormError", () => {
      const config = {
        defaultFieldTypes: {
          currency: {
            from: "number",
            validations: {},
            transformations: {
              after: [currencyFormat],
            },
          },
        },
      };
      const fields = {
        currencyField: 6,
      };
      const schema = {
        fields: {
          currencyField: {
            required: true,
            type: "currency",
            validations: {
              default: {
                maximum: 5,
              },
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
  });
});

describe("Use case", () => {
  describe("string is expected type but number is recived", () => {
    test("should throw an error", () => {
      const fields = {
        currencyField: 112,
      };
      const schema = {
        fields: {
          currencyField: {
            required: true,
            type: "string",
          },
        },
      };

      expect(() => buildSchema(schema, fields)).toThrowError();
    });
  });
});

describe("Custom date validations", () => {
  describe("older than 18 years", () => {
    test("should throw an error by invalid date", () => {
      const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                olderThan18: (field) => {
                  if (differenceInCalendarYears(new Date(), field.value) < 18) {
                    throw new ValidationError({
                      path: field.key,
                      message: `${field.key} must be at least 18 years from current date`,
                    });
                  }
                },
              },
            },
            transformations: {
              before: [
                (value) => {
                  return parse(value, "P", new Date(), {
                    locale: enUS,
                  });
                },
              ],
            },
          },
        },
      };
      const fields = {
        dateField: "01/01/2007",
      };
      const schema = {
        fields: {
          dateField: {
            type: "date",
            validations: {
              extends: ["olderThan18"],
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
    test("should pass validation by valid date", () => {
      const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                olderThan18: (field) => {
                  if (differenceInCalendarYears(new Date(), field.value) < 18) {
                    throw new ValidationError({
                      path: field.key,
                      message: `${field.key} must be at least 18 years from current date`,
                    });
                  }
                },
              },
            },
            transformations: {
              before: [
                (value) => {
                  return parse(value, "P", new Date(), {
                    locale: enUS,
                  });
                },
              ],
            },
          },
        },
      };
      const fields = {
        dateField: "01/01/2000",
      };
      const schema = {
        fields: {
          dateField: {
            type: "date",
            validations: {
              extends: ["olderThan18"],
            },
          },
        },
      };

      const values = buildSchema(schema, fields, config);

      const expectedDate = parse("01/01/2000", "P", new Date(), {
        locale: enUS,
      });
      expect(values).toMatchObject({
        dateField: expectedDate,
      });
    });
  });
  describe("not today", () => {
    test("should throw an error by invalid date", () => {
      const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                notToday: (field) => {
                  if (isToday(field.value)) {
                    throw new ValidationError({
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
            type: "date",
            validations: {
              extends: ["notToday"],
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
    test("should pass validation by valid date", () => {
      const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                notToday: (field) => {
                  if (isToday(field.value)) {
                    throw new ValidationError({
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
      const dateField = addDays(new Date(), 1);
      const fields = {
        dateField,
      };
      const schema = {
        fields: {
          dateField: {
            type: "date",
            validations: {
              extends: ["notToday"],
            },
          },
        },
      };
      const values = buildSchema(schema, fields, config);

      expect(values).toMatchObject({ dateField });
    });
  });
  describe("not this month and year", () => {
    test("should throw an error cause date its current month", () => {
      const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                notThisMonthAndYear: (field) => {
                  if (isThisMonth(field.value) && isThisYear(field.value)) {
                    throw new ValidationError({
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
            type: "date",
            validations: {
              extends: ["notThisMonthAndYear"],
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
    test("should pass validation cause date its 1 month ahead", () => {
      const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                notThisMonthAndYear: (field) => {
                  if (isThisMonth(field.value) && isThisYear(field.value)) {
                    throw new ValidationError({
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
      const dateField = addMonths(new Date(), 1);
      const fields = {
        dateField,
      };
      const schema = {
        fields: {
          dateField: {
            type: "date",
            validations: {
              extends: ["notThisMonthAndYear"],
            },
          },
        },
      };
      const values = buildSchema(schema, fields, config);

      expect(values).toMatchObject({ dateField });
    });
  });
  describe("should use multiple custom validations", () => {
    test("should throw an error cause date not match validations", () => {
      const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                notThisMonthAndYear: (field) => {
                  if (isThisMonth(field.value) && isThisYear(field.value)) {
                    throw new ValidationError({
                      path: field.key,
                      message: `${field.key} must not be this month and year`,
                    });
                  }
                },
                olderThan18: (field) => {
                  if (differenceInCalendarYears(new Date(), field.value) < 18) {
                    throw new ValidationError({
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
            type: "date",
            validations: {
              extends: ["notThisMonthAndYear", "olderThan18"],
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
  });
});

describe("Custom string validations", () => {
  describe("should use patterns", () => {
    test("should throw an error using custom pattern", () => {
      const config = {
        defaultFieldTypes: {
          string: {
            validations: {
              patterns: {
                onlyNumbers: (field) => {
                  if (!Number(field.value)) {
                    throw new ValidationError({
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
        stringField: "a123",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                patterns: ["onlyNumbers"],
              },
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
    test("should pass pattern", () => {
      const config = {
        defaultFieldTypes: {
          string: {
            validations: {
              patterns: {
                onlyNumbers: (field) => {
                  if (!Number(field.value)) {
                    throw new ValidationError({
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
        stringField: "123",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                patterns: ["onlyNumbers"],
              },
            },
          },
        },
      };
      const values = buildSchema(schema, fields, config);
      expect(values).toMatchObject(fields);
    });
    test("should throw an error cause pattern was not found", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "a123",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                patterns: ["onlyNumbers"],
              },
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
  });
});

describe("Default string validations", () => {
  describe("maxLength", () => {
    test("should throw an error cause field is longer than expected", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this is longer than 10",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                maxLength: 10,
              },
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError(
        FormErrors
      );
    });
    test("should pass validation cause field is shorter as expected", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this is less than 20",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                maxLength: 20,
              },
            },
          },
        },
      };
      const values = buildSchema(schema, fields, config);
      expect(values).toMatchObject(fields);
    });
  });
  describe("onlyLetters", () => {
    test("should throw an error cause field contains numbers", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this string has numbers 123",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                patterns: ["onlyLetters"],
              },
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
    test("should pass validation cause field not contain numbers", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this string not has numbers",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                patterns: ["onlyLetters"],
              },
            },
          },
        },
      };
      const values = buildSchema(schema, fields, config);
      expect(values).toMatchObject(fields);
    });
  });
});

describe("Multiple fields some required and not other", () => {
  describe("maxLength", () => {
    test("should throw an error cause field is longer than expected", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this is longer than 10",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                maxLength: 10,
              },
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
    test("should pass validation cause field is shorter as expected", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this is less than 20",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                maxLength: 20,
              },
            },
          },
        },
      };
      const values = buildSchema(schema, fields, config);
      expect(values).toMatchObject(fields);
    });
  });
  describe("onlyLetters", () => {
    test("should throw an error cause field contains numbers", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this string has numbers 123",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                patterns: ["onlyLetters"],
              },
            },
          },
        },
      };
      expect(() => buildSchema(schema, fields, config)).toThrowError();
    });
    test("should pass validation cause field not contain numbers", () => {
      const config = {
        defaultFieldTypes: {},
      };
      const fields = {
        stringField: "this string has numbers",
      };
      const schema = {
        fields: {
          stringField: {
            type: "string",
            validations: {
              default: {
                onlyLetters: true,
              },
            },
          },
        },
      };
      const values = buildSchema(schema, fields, config);
      expect(values).toMatchObject(fields);
    });
  });
});
