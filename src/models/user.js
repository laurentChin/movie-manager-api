function userModelFactory(sequelize, DataTypes) {
  const User = sequelize.define(
    "User",
    {
      fbid: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true
        }
      },
      passwordHash: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      signInToken: DataTypes.STRING,
      signInTokenExpirationDate: DataTypes.DATE,
      salt: DataTypes.STRING,
      lastLogin: DataTypes.DATE
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email"]
        },
        {
          unique: true,
          fields: ["fbid"]
        }
      ]
    }
  );

  return User;
}

module.exports = userModelFactory;
