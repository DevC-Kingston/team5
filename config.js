var Datastore = require("nedb");
const database = new Datastore("database.db");
database.loadDatabase();

module.exports = { database };

// data = {
//   ["12345"]: "tomato",
// };

// database.insert(data);
