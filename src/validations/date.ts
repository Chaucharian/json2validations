import { isValid } from "date-fns";
import { ValidationError } from "../errors";
import { hasToValidate } from "./utils";

export const isDate = (field, config) => {
  let isType = true;

  if (!isValid(field.value)) {
    config.setError(
      new ValidationError({
        path: field.key,
        message: `${field.key} must be a valid Date recived value was ${field.value}`,
      })
    );
    isType = false;
  }
  return isType;
};
