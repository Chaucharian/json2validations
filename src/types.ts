import { isString, maxLength, minLength, patterns } from "./validations/string";
import { isNumber, maximum, minimum } from "./validations/number";
import { isDate } from "./validations/date";

interface validationFunction {
  [k: string]: (
    field: { key: string; value: string | number | boolean },
    GlobalConfig: any,
    criteria?: string | number | boolean | []
  ) => void;
}
interface Type {
  basic: validationFunction; // this are the first validations to run
  default: validationFunction;
}

export const number: Type = {
  basic: {
    isNumber,
  },
  default: {
    minimum,
    maximum,
  },
};
export const string: Type = {
  basic: {
    isString,
  },
  default: {
    maxLength,
    minLength,
    patterns,
  },
};

export const boolean = {};

export const date: Type = {
  basic: {
    isDate,
  },
  default: {
    isDate,
  },
};
