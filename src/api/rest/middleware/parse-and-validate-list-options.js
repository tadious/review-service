const joi = require('@hapi/joi');

const ResponseError = require('./ResponseError');
const requestValidator = require('./request-validator');

const querySchema = allowedFields => joi.object().unknown(true).keys({
  filter: joi.object().unknown(false).keys(allowedFields.reduce((acc, cur) => {
    acc[cur] = joi.any();
    return acc;
  }, {})),
  range: joi.array().length(2).items(joi.number().positive().allow(0)),
  sort: joi.array().ordered(
    joi.string().valid(...allowedFields),
    joi.string().valid('ASC', 'DESC', 'asc', 'desc'),
  ),
});

const parseListOptions = (req, res, next) => {
  try {
    if (req.query.filter) {
      req.query.filter = JSON.parse(req.query.filter);
    }
    if (req.query.range) {
      req.query.range = JSON.parse(req.query.range);
    }
    if (req.query.sort) {
      req.query.sort = JSON.parse(req.query.sort);
    }
    next();
  } catch (err) {
    next(new ResponseError(400, 'Malformed json in list options query params (filter, range or sort)'));
  }
};

const extractListOptions = (req, res, next) => {
  const listOptions = {
    filters: [],
    pagination: {},
    sort: {},
  };
  if (req.query.filter) {
    const filters = req.query.filter;
    listOptions.filters = Object.entries(filters).map(([key, value]) => ({ key, value }));
  }
  if (req.query.range) {
    const [lowerBound, upperBound] = req.query.range;
    const limit = upperBound - lowerBound + 1;
    const offset = lowerBound;
    listOptions.pagination = {
      limit,
      offset,
    };
  }
  if (req.query.sort) {
    const [key, direction] = req.query.sort;
    listOptions.sort = {
      key,
      direction,
    };
  }
  req.listOptions = listOptions;
  next();
};

const parseAndValidateListOptions = allowedFields => ([
  parseListOptions,
  requestValidator('query', querySchema(allowedFields), { allowUnknown: false }),
  extractListOptions,
]);

module.exports = parseAndValidateListOptions;
