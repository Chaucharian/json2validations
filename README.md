<h1 align="center">json2validations</h1>

json2validations is a schema builder. Its main purpose is to create form validations from a JSON.

This library inherits the idea of how [JSONSchema Epecification](https://cswr.github.io/JsonSchema/) agroups entities, but tries to be a more declarative way of creating form validations.

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

`fields` its where you'll add the form fields you want to validate, every key in the object has to be a field name in your form. The idea its to define all its properties here to create the expected validation.

#### This is the schema shape

```json
{
    fields: {
        [FIELD_NAME]: {
            type: /* string | number | date | boolean */
            errorMessages: {
                [ERROR_NAME]: /* string */
            },
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

The config object will allow you to extend the functionality of the builder as create your custom types or hook up to the build flow adding transformations before and after validations are executed

This is a common scenario where you want a field to show currency amount.
Instead of having to create a mask for the field with the currency format and after that run some specefic validation, you could do it all here, declaratively

```js
const config = {
  /* Here goes your types overrides, as custom validations or transformations */
  defaultFieldTypes: {
    /* name of your custom or native (string, number...) type*/
    currency: {
      from: "number",
      validations: {},
      transformations: {
        after: [currencyFormat],
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
