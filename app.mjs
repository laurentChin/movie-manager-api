import express from 'express';
import jwt from 'express-jwt';

import environment from './environment';

import { User } from './src/models';
import { SecurityRouterFactory } from './src/security';

const app = express();

app
  .use(jwt({secret: environment.jwtSecretKey}).unless({path: /^\/security/}))
  .use(SecurityRouterFactory(express.Router(), User, environment.jwtSecretKey))
  .listen(environment.port, () => {});
