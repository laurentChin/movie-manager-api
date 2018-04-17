import sequelize from '../src/models';

sequelize
  .sync()
  .then(() => {
    console.log("all models sync succesfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
