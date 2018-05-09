import express from 'express';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

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
  .use(express.static('public', {fallthrough: false}))
  .use((err, request, response, next) => {
    if(/^\/uploads/.test(request.url)) {
      const posterFallback = fs.createReadStream(path.join(process.env.PWD, 'public', 'assets', 'poster-placeholder.png'));
      posterFallback
        .pipe(response);
    } else {
      next(err);
    }
  })
  .listen(environment.port, () => {});

export default app;
