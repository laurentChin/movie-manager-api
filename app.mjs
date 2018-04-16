import express from 'express';

import environment from './environment';

const app = express();

app.listen(environment.port, () => {});
