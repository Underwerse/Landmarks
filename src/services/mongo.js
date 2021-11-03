import { connectToDatabase } from '../util/mongodb';

export const init = async () => {
  let { db } = await connectToDatabase();

  return db;
};

export const getLandmarks = async () => {
  const db = await init();
  return await db.collection('landmarks').find({}).toArray();
};
