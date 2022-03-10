// Manifest
// This library is aimed to solve dynamic form validations comming from a JSON
// There're 3 principal concepts to play around with
// Validations
// - default validations
//    built in validations allow you to check if the field has the shape you expected
//
// - extended validations
//    these are your custom validations you could hook them up to a built in type or to a custom type
//
// - transformations
//    transformations are intended to work in custom types to perform any modification you want,
//    these are ran before and after validations
// Fields
// - Every field its by default optional

import Config from "./config";
// import GlobalConfig from './config';
import { SchemaTypeNotFound, FormErrors, SchemaError } from "./errors";

// const defaultTypes = Object.keys(
//   GlobalConfig.getDefaultConfig().defaultFieldTypes,
// ).join(',');

const runTransformations = (transformations, field) => {
  let fieldValue = field.value ?? null;
  transformations.forEach((transformation) => {
    fieldValue = transformation(fieldValue ?? field.value);
  });
  return { value: fieldValue, key: field.key };
};

const runCustomValidations = (
  field,
  schemaValidations = [],
  customValidations,
  config
) => {
  checkCustomValidations(schemaValidations, customValidations);
  schemaValidations.forEach((validationName) => {
    customValidations[validationName](field, config);
  });
};

const runBasicValidations = (field, typeName, config) => {
  const basicValidations =
    config.getDefaultConfig().defaultFieldTypes[typeName].validations.basic;
  Object.keys(basicValidations).forEach((validationName) => {
    basicValidations[validationName](field, config);
  });
};

const checkCustomValidations = (schemaValidations = [], customValidations) => {
  schemaValidations.forEach((validationName) => {
    if (!customValidations[validationName]) {
      throw new SchemaError(
        `The ${validationName} extended validation wasn't found in your config`
      );
    }
  });
};

const runSchemaCustomValidation = (fields, config) => {
  if (
    typeof config.getSchema()?.customValidation === "string" &&
    typeof config.getCustomConfig()?.customValidation === "object"
  ) {
    config
      .getCustomConfig()
      ?.customValidation[config.getSchema()?.customValidation](fields, config);
  }
};

const buildSchema = (
  schema: any,
  fields: any,
  config = { defaultFieldTypes: {} }
) => {
  const GlobalConfig = new Config();
  const defaultTypes = Object.keys(
    GlobalConfig.getDefaultConfig().defaultFieldTypes
  ).join(",");
  const getSchemaField = (key: string) => schema.fields[key];
  const isCustomType = (key: string) =>
    !GlobalConfig.getDefaultConfig().defaultFieldTypes[key] ? true : false;
  const getCustomType = (key: string) => config.defaultFieldTypes[key];
  const outputFields = {};

  // Validate if is default type or extends from one
  Object.keys(config.defaultFieldTypes).forEach((typeName) => {
    if (
      !GlobalConfig.getDefaultConfig().defaultFieldTypes[typeName] &&
      !GlobalConfig.getDefaultConfig().defaultFieldTypes[
        config.defaultFieldTypes[typeName]?.from
      ]
    ) {
      throw new SchemaTypeNotFound(
        `The type ${typeName} must be a default type or extend from a valid type, available types are: ${defaultTypes}`,
        typeName
      );
    }
  });

  GlobalConfig.setCustomConfig(config);
  GlobalConfig.setSchema(schema);
  console.log("EEEE", fields);
  const fieldsAmount = Object.keys(fields).length;
  Object.keys(fields).forEach((key: string, index: number) => {
    const field = { key, value: fields[key] };

    // if field exists on schema its optional by default
    // if field not exist on schema ignore it
    const isFieldInSchema = getSchemaField(key);
    if (!isFieldInSchema) {
      return;
    }

    // get default validations cause its a custom type or its native type (date, string, number ...)
    const extendsFromType =
      config.defaultFieldTypes[getSchemaField(key).type]?.from ??
      getSchemaField(key).type;

    // get validations from extended type or its a default type
    Object.keys(GlobalConfig.getDefaultValidations(extendsFromType)).forEach(
      (validationName: any) => {
        // if any criteria was added to some default validation just use undefined instead
        const validationCriteria = getSchemaField(key)?.validations?.default
          ? getSchemaField(key)?.validations?.default[validationName]
          : undefined;

        const hasDefaultValidations =
          getSchemaField(key)?.validations?.default &&
          getSchemaField(key)?.validations?.default[validationName];
        // only run them if they're in the schema
        const runDefaultValidation = GlobalConfig.getDefaultValidation(
          extendsFromType,
          validationName
        );

        const firstTransformations =
          config.defaultFieldTypes[getSchemaField(key).type]?.transformations
            ?.before ?? [];
        const secondTransformations =
          config.defaultFieldTypes[getSchemaField(key).type]?.transformations
            ?.after ?? [];

        // 1# STEP RUN TRANSFORMATIONS IF ANY
        let transformatedField = runTransformations(
          firstTransformations,
          field
        );

        // 2# STEP RUN BASIC TYPE VALIDATIONS
        // always run basic validations for every type
        runBasicValidations(
          {
            ...transformatedField,
            required: getSchemaField(key).required === true ? true : false,
          },
          extendsFromType,
          GlobalConfig
        );
        // 3# STEP RUN DEFAULT TYPE VALIDATIONS
        hasDefaultValidations &&
          runDefaultValidation(
            transformatedField,
            validationCriteria,
            GlobalConfig
          );

        //4# STEP RUN CUSTOM TYPE VALIDATIONS
        // run custom validations if any
        runCustomValidations(
          transformatedField,
          getSchemaField(key).validations?.extends,
          config.defaultFieldTypes[getSchemaField(key).type]?.validations
            ?.extends,
          GlobalConfig
        );

        //6# STEP RUN LAST TRANSFORMATIONS (OUTPUT)
        transformatedField = runTransformations(
          secondTransformations,
          transformatedField
        );

        //7# STEP RETURN NEW FIELDS
        // store field values for each field in a new obj
        outputFields[key] = transformatedField.value;
      }
    );
  });
  //8# STEP RUN CUSTOM SCHEMA VALIDATION
  // run it once all the fields have been transformed and validated
  // this validation gets all the fields and the current config to make any validation
  runSchemaCustomValidation(outputFields, GlobalConfig);

  if (GlobalConfig.getErrors().length > 0) {
    throw new FormErrors(GlobalConfig.getErrors());
  }

  return outputFields;
};

export default buildSchema;

export const ejemplo = { a: 1 };
