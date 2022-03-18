import { ValidationError } from "../errors";
import { getErrorMessage, hasToValidate } from "./utils";

// IF NATIVE VALIDATIONS FAIL NOT RUN THE NEXT ONES SET A FLAG OR SOMETHING
export const isNumber = (field, config) => {
  let isType = true;

  if (typeof field.value !== "number") {
    config.setError(
      new ValidationError({
        path: field.key,
        message:
          getErrorMessage(field, "isNumber", config) ??
          `${field.key} must be a number received was ${field.value} `,
      })
    );
    isType = false;
  }
  return isType;
};

export const minimum = (field, criteria, config) => {
  if (field.value < criteria) {
    config.setError(
      new ValidationError({
        path: field.key,
        message:
          getErrorMessage(field, "minimum", config) ??
          `${field.key} couldn't be less than ${criteria}`,
      })
    );
  }
};

export const maximum = (field, criteria, config) => {
  if (field.value > criteria) {
    config.setError(
      new ValidationError({
        path: field.key,
        message:
          getErrorMessage(field, "maximum", config) ??
          `${field.key} couldn't be greater than ${criteria}`,
      })
    );
  }
};
