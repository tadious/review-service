const config = require('./config');
const { boot } = require('./boot');

boot(config[process.env.NODE_ENV]);
