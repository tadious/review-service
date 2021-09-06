const { expect } = require('chai');

const configSchema = require('../../config-schema');
const config = require('../config');

describe('Config validation', () => {
  it('Validation passes for valid config', () => {
    const result = configSchema.validate(config, {
      allowUnknown: false,
      abortEarly: false,
    });
    if (result.error) {
      throw result.error;
    }
  });

  it('Validation fails for empty config', () => {
    const result = configSchema.validate({}, {
      allowUnknown: false,
      abortEarly: false,
    });
    expect(result.error).an('error');
  });
});
