const mongoose = require('mongoose');
const { MONGODB_URI, MONGODB_DB } = process.env;

const connection = {};

const dbConnect = async () => {
  if (connection.isConnected) {
    console.log('DB has already been connected');
    return;
  }

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  if (!MONGODB_DB) {
    throw new Error(
      'Please define the MONGODB_DB environment variable inside .env'
    );
  }

  const db = await mongoose.connect(MONGODB_URI.concat(MONGODB_DB), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection.isConnected = db.connections[0].readyState;
  console.log(`DB connected: ${Boolean(connection.isConnected)}`);

  return db;
};

module.exports = {
  dbConnect,
};
