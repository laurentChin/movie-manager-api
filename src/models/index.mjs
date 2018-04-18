import Sequelize from 'sequelize';

import environment from '../../environment';
import userModelFactory from './user';
import movieModelFactory from './movie';

const { database } = { ...environment };

const sequelize = new Sequelize(database.name, database.username, database.password, database.config);
const User = userModelFactory(sequelize, Sequelize.DataTypes);
const Movie = movieModelFactory(sequelize, Sequelize.DataTypes);

export {
  User,
  Movie
};

export default sequelize;
