import Koa from 'koa';
import Router from 'koa-router';

import environment from './environment.json';

import { SecurityRouterFactory } from './src/security';

const app = new Koa();

const router = new Router();
app
  .use(SecurityRouterFactory(router).routes())
  .listen(environment.port);
