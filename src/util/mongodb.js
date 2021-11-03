const mongoose = require('mongoose');
const { MONGODB_URI, MONGODB_DB } = process.env;

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    console.log('DB has already been connected');
    return;
  }

  const db = await mongoose.connect(MONGODB_URI.concat(MONGODB_DB), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection.isConnected = db.connections[0].readyState;
  console.log(`DB connected: ${Boolean(connection.isConnected)}`);

  return db;
}

module.exports = dbConnect;
