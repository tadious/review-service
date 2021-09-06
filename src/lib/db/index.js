const Bookshelf = require('bookshelf');

const TestUtils = require('./DBUtils');
const { Mapper, MapperError } = require('./Mapper');

/** @type {Bookshelf} */
let bookshelfInstance;

let knexInstance;

/** @type {TestUtils} **/
let testUtils;

let mapper;

module.exports = class DBBookshelf {
  static init(knex, models, mappers = {}) {
    knexInstance = knex;
    bookshelfInstance = Bookshelf(knexInstance);
    mapper = new Mapper(mappers, bookshelfInstance);

    for (const className of Object.keys(models)) {
      models[className].model(bookshelfInstance);
    }

    if (process.env.NODE_ENV === 'test') {
      testUtils = new TestUtils(knexInstance);
    }
  }

  static transaction(transactionCallback) {
    if (!bookshelfInstance) {
      throw new Error('DB not initialized!');
    }
    return bookshelfInstance.transaction(transactionCallback);
  }

  static get bookshelf() {
    if (!bookshelfInstance) {
      throw new Error('DB not initialized!');
    }
    return bookshelfInstance;
  }

  static get knex() {
    if (!knexInstance) {
      throw new Error('DB not initialized!');
    }
    return knexInstance;
  }

  static model(className) {
    if (!bookshelfInstance) {
      throw new Error('DB not initialized!');
    }
    return bookshelfInstance.model(className);
  }

  static get testUtils() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('You cannot create/truncate outside of tests.');
    }

    if (!testUtils) {
      throw new Error('TestUtils not instantiated!');
    }

    return testUtils;
  }

  static get mapper() {
    if (!mapper) {
      throw new MapperError('Mapper is not instantiated!');
    }
    return mapper;
  }
};
