const envMap = {
    development: 'dev',
    production: 'prod',
};

const confPath = envMap[process.env.NODE_ENV];

module.exports = require('./' + confPath);
