/** @format */

const validations = {
  required (value) {
    if (!value) return true;

    if (value.constructor === Array) {
      if (!value.length) return true;
    } else if (!value.toString().trim().length) {
      return true;
    }
  },
  email (value) {
    // eslint-disable-next-line
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // From: https://emailregex.com/

    return !emailRegex.test(value) || value.length > 255;
  },
  date (value) {
    return new Date(value).toString() === 'Invalid Date';
  },
  gender (value) {
    return value !== 'male' && value !== 'female';
  },
  maxLength (value, max) {
    return value.toString().length > parseFloat(max);
  }
};

/**
 * Validate if the value is valid or not
 * @param  {Any} value The value to be validated
 * @param  {Array} rules Array of validation rules
 * @return {Boolean} false if validations fail, the value is invalid.
 */
module.exports = (value, rules) => {
  for (let a = 0, maxA = rules.length; a < maxA; a++) {
    let rule = rules[a];
    let payload = [];

    if (rule.includes(':')) {
      const [_rule, _payload] = rule.split(':');
      rule = _rule;
      payload = _payload.split(',');
    }

    if (validations[rule](value, ...payload)) return false;
  }

  return true;
};
