var Datastore = require("nedb");
const path = require("path");

const database = new Datastore({
  filename: path.join(__dirname, "./database.db"),
  autoload: true,
});
database.loadDatabase();

module.exports = { database };

// data = {
//   ["12345"]: "tomato",
// };

// database.insert(data);
