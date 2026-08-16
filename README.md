# /!\ WIP /!\

This is a side-project focused on learning new technologies and experimenting ideas.
The main pattern used in this is "Getting the shit done!"

# api

API Part of my Movie manager project build on top of ExpressJS

## installation

This project provides a Makefile which install the dependencies and generates a parameters.yml based on parameters.yml
.dist run it with `make` command

## Running the project

### Prerequisites

- Node.js 22
- A PostgreSQL database, reachable with the credentials you put in `environment.json` (see below)

### Setup

```bash
make install
```

This runs `npm install` and, if `environment.json` doesn't exist yet, creates it by copying `environment.json.dist`. Edit the generated `environment.json` with your local database credentials, a JWT secret, etc.

Then create the schema:

```bash
npm run db:sync
```

This synchronizes Sequelize's models with the database (creates tables if they don't exist). To apply/roll back a specific migration from `src/migrations/` instead:

```bash
npm run db:migrate -- <migration-file> up
npm run db:migrate -- <migration-file> down
```

### Dev server

```bash
npm start
```

Runs the API with `nodemon` (auto-restart on change, `--inspect` for the debugger) on the port set in `environment.json`. GraphQL is served at `/graphql`.

### Tests & linting

```bash
npm test          # eslint + ava
npm run test:watch
```
