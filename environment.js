const fs = require('fs');

const loadEnvironment = (NODE_ENV) => {
  let environment;

  switch (NODE_ENV) {
    case 'test':
      environment = JSON.parse(fs.readFileSync('./environment-test.json'));
      break;
    default:
      environment = JSON.parse(fs.readFileSync('./environment.json'));
  }

  return environment;
};

module.exports = loadEnvironment(process.env.NODE_ENV);
