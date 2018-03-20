const envMap = {
    development: 'dev',
    production: 'prod',
};

const confModule = envMap[process.env.NODE_ENV];

module.exports = require('./' + confModule);
