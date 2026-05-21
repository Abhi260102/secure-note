export const andHelper = (condition, value) => {
  return condition ? value : null;
};

export const orHelper = (value, fallback) => {
  return value || fallback;
};

export const ternaryHelper = (condition, trueValue, falseValue) => {
  return condition ? trueValue : falseValue;
};
