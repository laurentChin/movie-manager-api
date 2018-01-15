import Koa from 'koa';

import environment from './environment.json';

const app = new Koa();

app.listen(environment.port);
