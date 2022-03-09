import { isValid } from 'date-fns';
import { ValidationError } from '../errors';
import { hasToValidate } from './utils';

export const isDate = (field, config) => {
  if (!hasToValidate(field)) {
    return;
  }
  if (!isValid(field.value)) {
    config.setError(
      new ValidationError({
        path: field.key,
        message: `${field.key} must be a valid Date recived value was ${field.value}`,
      }),
    );
  }
};
