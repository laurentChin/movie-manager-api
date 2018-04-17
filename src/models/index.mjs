import Sequelize from 'sequelize';

import environment from '../../environment';
import modelFactory from './user';

const { database } = { ...environment };

const sequelize = new Sequelize(database.name, database.username, database.password, database.config);
const User = modelFactory(sequelize, Sequelize.DataTypes);

export {
  User
};

export default sequelize;
