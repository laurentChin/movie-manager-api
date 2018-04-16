import Sequelize from 'sequelize';

import environment from '../../environment';

const { database } = { ...environment };

const sequelize = new Sequelize(database.name, database.username, database.password, database.config);

export default sequelize;
