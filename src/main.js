"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
// import GlobalConfig from './config';
const errors_1 = require("./errors");
// const defaultTypes = Object.keys(
//   GlobalConfig.getDefaultConfig().defaultFieldTypes,
// ).join(',');
const runTransformations = (transformations, field) => {
    var _a;
    let fieldValue = (_a = field.value) !== null && _a !== void 0 ? _a : null;
    transformations.forEach(transformation => {
        fieldValue = transformation(fieldValue !== null && fieldValue !== void 0 ? fieldValue : field.value);
    });
    return { value: fieldValue, key: field.key };
};
const runCustomValidations = (field, schemaValidations = [], customValidations, config) => {
    checkCustomValidations(schemaValidations, customValidations);
    schemaValidations.forEach(validationName => {
        customValidations[validationName](field, config);
    });
};
const runBasicValidations = (field, typeName, config) => {
    const basicValidations = config.getDefaultConfig().defaultFieldTypes[typeName].validations.basic;
    Object.keys(basicValidations).forEach(validationName => {
        basicValidations[validationName](field, config);
    });
};
const checkCustomValidations = (schemaValidations = [], customValidations) => {
    schemaValidations.forEach(validationName => {
        if (!customValidations[validationName]) {
            throw new errors_1.SchemaError(`The ${validationName} extended validation wasn't found in your config`);
        }
    });
};
const runSchemaCustomValidation = (fields, config) => {
    var _a, _b, _c, _d;
    if (typeof ((_a = config.getSchema()) === null || _a === void 0 ? void 0 : _a.customValidation) === 'string' &&
        typeof ((_b = config.getCustomConfig()) === null || _b === void 0 ? void 0 : _b.customValidation) === 'object') {
        (_c = config
            .getCustomConfig()) === null || _c === void 0 ? void 0 : _c.customValidation[(_d = config.getSchema()) === null || _d === void 0 ? void 0 : _d.customValidation](fields, config);
    }
};
const buildSchema = (schema, fields, config = { defaultFieldTypes: {} }) => {
    const GlobalConfig = new config_1.default();
    const defaultTypes = Object.keys(GlobalConfig.getDefaultConfig().defaultFieldTypes).join(',');
    const getSchemaField = (key) => schema.fields[key];
    const isCustomType = (key) => !GlobalConfig.getDefaultConfig().defaultFieldTypes[key] ? true : false;
    const getCustomType = (key) => config.defaultFieldTypes[key];
    const outputFields = {};
    // Validate if is default type or extends from one
    Object.keys(config.defaultFieldTypes).forEach(typeName => {
        var _a;
        if (!GlobalConfig.getDefaultConfig().defaultFieldTypes[typeName] &&
            !GlobalConfig.getDefaultConfig().defaultFieldTypes[(_a = config.defaultFieldTypes[typeName]) === null || _a === void 0 ? void 0 : _a.from]) {
            throw new errors_1.SchemaTypeNotFound(`The type ${typeName} must be a default type or extend from a valid type, available types are: ${defaultTypes}`, typeName);
        }
    });
    GlobalConfig.setCustomConfig(config);
    GlobalConfig.setSchema(schema);
    console.log('EEEE', fields);
    const fieldsAmount = Object.keys(fields).length;
    Object.keys(fields).forEach((key, index) => {
        var _a, _b;
        const field = { key, value: fields[key] };
        // if field exists on schema its optional by default
        // if field not exist on schema ignore it
        const isFieldInSchema = getSchemaField(key);
        if (!isFieldInSchema) {
            return;
        }
        // get default validations cause its a custom type or its native type (date, string, number ...)
        const extendsFromType = (_b = (_a = config.defaultFieldTypes[getSchemaField(key).type]) === null || _a === void 0 ? void 0 : _a.from) !== null && _b !== void 0 ? _b : getSchemaField(key).type;
        // get validations from extended type or its a default type
        Object.keys(GlobalConfig.getDefaultValidations(extendsFromType)).forEach((validationName) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            // if any criteria was added to some default validation just use undefined instead
            const validationCriteria = ((_b = (_a = getSchemaField(key)) === null || _a === void 0 ? void 0 : _a.validations) === null || _b === void 0 ? void 0 : _b.default)
                ? (_d = (_c = getSchemaField(key)) === null || _c === void 0 ? void 0 : _c.validations) === null || _d === void 0 ? void 0 : _d.default[validationName]
                : undefined;
            const hasDefaultValidations = ((_f = (_e = getSchemaField(key)) === null || _e === void 0 ? void 0 : _e.validations) === null || _f === void 0 ? void 0 : _f.default) &&
                ((_h = (_g = getSchemaField(key)) === null || _g === void 0 ? void 0 : _g.validations) === null || _h === void 0 ? void 0 : _h.default[validationName]);
            // only run them if they're in the schema
            const runDefaultValidation = GlobalConfig.getDefaultValidation(extendsFromType, validationName);
            const firstTransformations = (_l = (_k = (_j = config.defaultFieldTypes[getSchemaField(key).type]) === null || _j === void 0 ? void 0 : _j.transformations) === null || _k === void 0 ? void 0 : _k.before) !== null && _l !== void 0 ? _l : [];
            const secondTransformations = (_p = (_o = (_m = config.defaultFieldTypes[getSchemaField(key).type]) === null || _m === void 0 ? void 0 : _m.transformations) === null || _o === void 0 ? void 0 : _o.after) !== null && _p !== void 0 ? _p : [];
            // 1# STEP RUN TRANSFORMATIONS IF ANY
            let transformatedField = runTransformations(firstTransformations, field);
            // 2# STEP RUN BASIC TYPE VALIDATIONS
            // always run basic validations for every type
            runBasicValidations(Object.assign(Object.assign({}, transformatedField), { required: getSchemaField(key).required === true ? true : false }), extendsFromType, GlobalConfig);
            // 3# STEP RUN DEFAULT TYPE VALIDATIONS
            hasDefaultValidations &&
                runDefaultValidation(transformatedField, validationCriteria, GlobalConfig);
            //4# STEP RUN CUSTOM TYPE VALIDATIONS
            // run custom validations if any
            runCustomValidations(transformatedField, (_q = getSchemaField(key).validations) === null || _q === void 0 ? void 0 : _q.extends, (_s = (_r = config.defaultFieldTypes[getSchemaField(key).type]) === null || _r === void 0 ? void 0 : _r.validations) === null || _s === void 0 ? void 0 : _s.extends, GlobalConfig);
            //6# STEP RUN LAST TRANSFORMATIONS (OUTPUT)
            transformatedField = runTransformations(secondTransformations, transformatedField);
            //7# STEP RETURN NEW FIELDS
            // store field values for each field in a new obj
            outputFields[key] = transformatedField.value;
        });
    });
    //8# STEP RUN CUSTOM SCHEMA VALIDATION
    // run it once all the fields have been transformed and validated
    // this validation gets all the fields and the current config to make any validation
    runSchemaCustomValidation(outputFields, GlobalConfig);
    if (GlobalConfig.getErrors().length > 0) {
        throw new errors_1.FormErrors(GlobalConfig.getErrors());
    }
    return outputFields;
};
exports.default = buildSchema;
