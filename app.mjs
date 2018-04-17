import express from 'express';

import environment from './environment';

import { User } from './src/models';
import { SecurityRouterFactory } from './src/security/router';

const app = express();

app
  .use(SecurityRouterFactory(express.Router(), User))
  .listen(environment.port, () => {});
