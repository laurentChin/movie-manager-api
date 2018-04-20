import Sequelize from 'sequelize';

import environment from '../../environment';
import userModelFactory from './user';
import movieModelFactory from './movie';
import formatModelFactory from './format';

const { database } = { ...environment };

const sequelize = new Sequelize(database.name, database.username, database.password, database.config);
const User = userModelFactory(sequelize, Sequelize.DataTypes);
const Format = formatModelFactory(sequelize, Sequelize.DataTypes);
const Movie = movieModelFactory(sequelize, Sequelize.DataTypes);

Movie.belongsToMany(Format, {through: 'movies_formats'});
Format.belongsToMany(Movie, {through: 'movies_formats'});

export {
  User,
  Movie,
  Format
};

export default sequelize;
