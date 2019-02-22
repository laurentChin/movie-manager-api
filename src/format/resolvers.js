const { Format } = require("../models");

const resolvers = {
  Query: {
    getFormats: async () => {
      return Format.findAll();
    }
  }
};

module.exports = resolvers;
