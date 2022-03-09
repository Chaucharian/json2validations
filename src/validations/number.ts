import { ValidationError } from '../errors';
import { getErrorMessage, hasToValidate } from './utils';

export const isNumber = (field, config) => {
  if (!hasToValidate(field)) {
    return;
  }
  if (!Number(field.value)) {
    config.setError(
      new ValidationError({
        path: field.key,
        message:
          getErrorMessage(field, 'isNumber', config) ??
          `${field.key} must be a number received was ${field.value} `,
      }),
    );
  }
};

export const minimum = (field, criteria, config) => {
  if (!hasToValidate(field)) {
    return;
  }
  if (field.value < criteria) {
    config.setError(
      new ValidationError({
        path: field.key,
        message:
          getErrorMessage(field, 'minimum', config) ??
          `${field.key} couldn't be less than ${criteria}`,
      }),
    );
  }
};

export const maximum = (field, criteria, config) => {
  if (!hasToValidate(field)) {
    return;
  }
  if (field.value > criteria) {
    config.setError(
      new ValidationError({
        path: field.key,
        message:
          getErrorMessage(field, 'maximum', config) ??
          `${field.key} couldn't be greater than ${criteria}`,
      }),
    );
  }
};
