<h1 align="center">json2validations</h1>

json2validations is a schema builder and Schema Definition the main purpose is to create form validations from a JSON.
It allows implementing complex data validation logic via declarative schemas for your form data, without writing code.

## Table of contents

1. [Install ](#Install)
2. [Builder ](#Builder)
3. [Schema](#Schema)
4. [Config](#Config)
5. [Use case](#Usecase)
   - [Using native types](#native)
   - [Using custom types](#custom)

## Install

```sh
yarn add json2validations
```

## Builder

`buildSchema` method does one simple task, validates the fields against the JSON and returns all the fields in case everything went well or throws and exception in case of error. This method can be configured throught a config object, this will allow you to override and extend from native types to create any validation or pattern (string only)

```js
buildSchema(schema, fields, config);
```

## Schema

The schema is the heart of the system, other JSON schema validations libraries implement [JSONSchema Specification](https://cswr.github.io/JsonSchema/) to advantage of its standarized interface, that result loosing scope trying to solve a lot of scenarios. This new schema its aimed to solve form validations only, giving you more flexibility making custom validations and more.

Let's get started understanding how all the pieces go together into the schema.

All in the schema are fields, to explain that to the schema builder you have to add the `fields` key to your JSON, every key will be a field, there's where you add the form fields you want to validate, every key name has to be a field name in your form.

```js
{
    fields: {
        [FIELD_NAME]: {
            type: '',/* string | number | date | boolean */
            errorMessages: {
                [ERROR_NAME]: "some custom error message" /* string */
            },
            required: 'false',/* boolean */
            validations: {
                default: {
                    /* number type only */
                    maximum: /* number */
                    minimum: /* number */
                    /* string type only */
                    maxLength: /* number */
                    minLength: /* number */
                    patterns: /* [customRegEx | customPattern | "onlyLetters" ] */
                },
                extends: /* [customValidationName, customValidationName2] */
            }
        }
     }
}
```

## Config

The config object will allow you to extend the functionality of the builder as create your custom types or hook up to the build flow, also create transformations before and after validations are executed

Here you define all the patterns, validations and transformations you'll expect for every field type
To add your custom functionality you have to match the name type, `defaultFieldTypes` its where all the types are defined
Type interface allows a few keys:

`from` name type to extend validations from

`validations` object of custom validations

- `patterns` (string only) an Array of custom patterns
- `extends` here define your custom validation functions

`transformations` object to apply value transformations before and after validations

- `before` an Array of transformations to be executed before validations
- `after` an Array of transformations to be executed after validations

```js
const config = {
  defaultFieldTypes: {
    /* name type (string, number...)*/
    [string | number | boolean | date]: {
      from: "string | number | boolean | date",
      validations: {
          patterns: [function someCustomPattern(field, config) {}],
        extends: {
          someCustomValidation: (field, config) {}
        }
      },
      transformations: {
        after: [function someTransformation(value) {}: any],
      },
    },
};
```

## Use case

- native type validations

Imagine you have a field that accepts less than 10 characters, that will look something like this

```js
/* this is your form fields */
const fields = {
  testingField: "this is longer than 10",
};
/* this is your JSON schema (coming from an API maybe...) */
const schema = {
  fields: {
    testingField: {
      type: "string",
      validations: {
        default: {
          maxLength: 10,
        },
      },
    },
  },
};

const fields = buildSchema(schema, fields);

// OUTPUT
// FormErrors: testinField max length of 10 exceded
```

- custom validations

Imagine you have a date field that validates if the value entered is this month or this year.
To create that custom validation just 2 steps are needed.

1. add your custom validation into `extends`
2. pass your error with config.`setError`

```js
/* config to schema builder */
  const config = {
        defaultFieldTypes: {
          date: {
            validations: {
              extends: {
                notThisMonthAndYear: (field, config) => {
                  if (isThisMonth(field.value) && isThisYear(field.value)) {
                    config.setError(new ValidationError({
                      path: field.key,
                      message: `${field.key} must not be this month and year`,
                    });
                  })
                },
              },
            },
          },
        },
      };

/* these are  your form fields */
const fields = {
  testingField: new Date(),
};
/* this is your JSON schema (coming from an API maybe...) */
 const schema = {
        fields: {
          testingField: {
            type: "date",
            validations: {
              extends: ["notThisMonthAndYear"],
            },
          },
        },
      };

const fields = buildSchema(schema, fields, config);
```
