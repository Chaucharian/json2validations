import { SchemaError, ValidationError } from "../errors";
import { getErrorMessage } from "./utils";

export const isString = (field, config) => {
  let isType = true;
  if (typeof field.value !== "string") {
    config.setError(
      new ValidationError({
        path: field.key,
        message:
          getErrorMessage(field, "isString", config) ??
          `${field.key} must be a string`,
      })
    );
    isType = false;
  }
  return isType;
};

export const maxLength = (field, criteria, config) => {
  if (field.value.length > criteria) {
    config.setError(
      new ValidationError({
        path: field.key,
        message: `${field.key} max length of ${criteria} exceded`,
      })
    );
  }
};

export const minLength = (field, criteria, config) => {
  if (field.value.length < criteria) {
    config.setError(
      new ValidationError({
        path: field.key,
        message: `${field.key} couldn't be less than ${criteria}`,
      })
    );
  }
};

const PATTERNS = {
  onlyLetters: (field, config) => {
    if (!field.value.match(/^([^0-9]*)$/)) {
      config.setError(
        new ValidationError({
          path: field.key,
          message: "only letters allowed",
        })
      );
    }
  },
};
// only patterns names (i.e onlyLetters) and regExs are accepted
export const patterns = (field, schemaPatterns, config) => {
  schemaPatterns?.forEach((pattern: any) => {
    if (typeof pattern !== "string" && typeof pattern !== "object") {
      console.warn("custom pattern name or regEx is expected");
      return;
    }
    if (typeof pattern === "string") {
      // get user config and search custom pattern first if not found look for default
      const customPatterns =
        config.getCustomConfig()?.defaultFieldTypes?.string?.validations
          ?.patterns ?? {};
      if (customPatterns[pattern]) {
        customPatterns[pattern](field, config);
      } else if (PATTERNS[pattern]) {
        PATTERNS[pattern](field, config);
      } else {
        throw new SchemaError(`pattern ${pattern} not found`);
      }
    }
    if (typeof pattern === "object") {
      if (!field.value.match(pattern)) {
        config.setError(
          new ValidationError({
            path: field.key,
            message: `${field.key} doesn't meet pattern criteria`,
          })
        );
      }
    }
  });
};
