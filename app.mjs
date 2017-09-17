import express from 'express';

import environment from './environment.json';

const app = express();

app.listen(environment.port, () => {});
