import fs from 'fs';
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

export default loadEnvironment(process.env.NODE_ENV);