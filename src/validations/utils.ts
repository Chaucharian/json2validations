const isOptionalWithValue = field => !field.required && field.value;
const isRequired = field => field.required;

export const hasToValidate = field =>
  isOptionalWithValue(field) || isRequired(field);

export const getErrorMessage = (field, errorName, config) => {
  let message = undefined;

  if (config.getSchemaField(field.key)?.errorMessages) {
    message = config.getSchemaField(field.key)?.errorMessages[errorName];
  }

  return message;
};
