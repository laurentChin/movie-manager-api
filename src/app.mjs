import express from 'express';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';
import cors from 'cors';

import environment from '../environment';

import { User, Movie, Format } from './models/index';
import { securityRouterFactory } from './security/index';
import { movieRouterFactory } from './movie/index';
import { formatRouterFactory } from './format/index';

const app = express();

app
  .use(bodyParser.json({limit: '8mb'}))
  .use(cors())
  .use(jwt({secret: environment.jwtSecretKey}).unless({path: [/^\/security/, /^\/uploads/]}))
  .use('/security', securityRouterFactory(express.Router(), User, environment.jwtSecretKey))
  .use('/movies', movieRouterFactory(express.Router(), Movie, User, Format))
  .use('/formats', formatRouterFactory(express.Router(), Format))
  .use(express.static('public'))
  .listen(environment.port, () => {});

export default app;
