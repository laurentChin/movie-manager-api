import express from 'express';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';

import environment from './environment';

import { User, Movie } from './src/models';
import { securityRouterFactory } from './src/security';
import { movieRouterFactory } from './src/movie';

const app = express();

app
  .use(bodyParser.json())
  .use(jwt({secret: environment.jwtSecretKey}).unless({path: /^\/security/}))
  .use('/security', securityRouterFactory(express.Router(), User, environment.jwtSecretKey))
  .use('/movies', movieRouterFactory(express.Router(), Movie, User))
  .listen(environment.port, () => {});
