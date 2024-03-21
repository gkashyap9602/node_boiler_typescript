import mongoose from "mongoose";
import { DB } from "../constants/app.constant";

export const connection = async () => {

  let MONGO_URI = await DB.MONGODB_URI
  let DB_NAME = await DB.DB_NAME

  console.log(MONGO_URI, "MONGO_URI_CONNECTION_SIDE")
  mongoose.Promise = global.Promise;

  await mongoose.connect(MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME,
  } as mongoose.ConnectOptions)

  const db = mongoose.connection;

  db.once('open', () => {
    console.log("connection established", MONGO_URI);
  });

  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });


}


