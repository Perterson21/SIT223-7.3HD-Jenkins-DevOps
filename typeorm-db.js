var typeorm = require("typeorm");
var EntitySchema = typeorm.EntitySchema;

const Users = require("./entity/Users");

const isDocker = process.env.DOCKER === '1';

typeorm.createConnection({
  name: "mysql",
  type: "mysql",

  // Local: localhost:3307
  // Docker: good-mysql:3306
  host: isDocker ? "good-mysql" : "localhost",
  port: isDocker ? 3306 : 3307,

  username: "root",
  password: "root",
  database: "acme",

  synchronize: true,
  logging: true,

  entities: [
    new EntitySchema(Users)
  ]
}).then(() => {

  const dbConnection = typeorm.getConnection("mysql");

  const repo = dbConnection.getRepository("Users");
  return repo;

}).then((repo) => {

  console.log(
    "Seeding 2 users to MySQL users table: Liran (role: user), Simon (role: admin)"
  );

  const inserts = [
    repo.insert({
      name: "Liran",
      address: "IL",
      role: "user"
    }),

    repo.insert({
      name: "Simon",
      address: "UK",
      role: "admin"
    })
  ];

  return Promise.all(inserts);

}).then(() => {

  console.log("MySQL connection and user seeding completed successfully");

}).catch((err) => {

  console.error("Failed connecting and seeding users to the MySQL database");
  console.error(err);

});