const Sequelize = require("sequelize");
const parse = require("date-fns/parse");

const resolvers = {
  Query: {
    logs: async (parent, { createdAt }, { user, model }) => {
      const query = {
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: model.user,
            where: {
              email: user.email
            }
          }
        ]
      };

      if (createdAt) {
        query.where = {
          createdAt: {
            [Sequelize.Op.gt]: parse(parseInt(createdAt))
          }
        };
      }

      const logInstance = await model.Log.findAll(query);

      return logInstance.map(({ model, action, createdAt, payload }) => ({
        model,
        action,
        createdAt,
        payload
      }));
    }
  }
};

module.exports = {
  resolvers
};
