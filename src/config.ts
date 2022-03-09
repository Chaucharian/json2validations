import { ValidationError } from './errors';
import { date, number, string } from './types';

class Config {
  private schema: any = null;
  private customConfig: any = null;
  private defaultConfig: any = null;
  private errors: any[] = [];

  constructor() {
    this.defaultConfig = {
      defaultFieldTypes: {
        string: {
          validations: {
            ...string,
          },
        },
        number: {
          validations: {
            ...number,
          },
        },
        date: {
          validations: {
            ...date,
          },
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
    return this.schema?.fields[fieldName];
  }
  getDefaultConfig() {
    return this.defaultConfig;
  }
  getDefaultValidations(type: string) {
    return this.defaultConfig.defaultFieldTypes[type]?.validations?.default;
  }
  getDefaultValidation(type: string, validationName: string) {
    return this.defaultConfig.defaultFieldTypes[type]?.validations?.default[
      validationName
    ];
  }
  getErrors() {
    return this.errors;
  }

  setError(newError: ValidationError) {
    const errorExists = this.errors.find(error => error.path === newError.path);
    if (errorExists) {
      this.errors = this.errors.map(error => {
        if (error.path === newError.path) {
          return { ...newError };
        }
        return error;
      });
    } else {
      this.errors.push(newError);
    }
  }
}

// let GlobalConfig = null;

// if (!GlobalConfig) {
//   GlobalConfig = new Config();
// }

export default Config;
