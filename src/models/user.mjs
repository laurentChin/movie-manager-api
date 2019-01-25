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
      }
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

export default userModelFactory;
