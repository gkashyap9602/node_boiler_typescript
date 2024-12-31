import mongoose from "mongoose";
import { DB ,AWS_CREDENTIAL} from "../constants/app.constant";

export const connection = async () => {

  const MONGO_URI = await DB.MONGODB_URI
  console.log(MONGO_URI, "MONGO_URI_CONNECTION_SIDE")
  const ACCESSID = await AWS_CREDENTIAL.ACCESSID
  const AWS_SECRET = await AWS_CREDENTIAL.AWS_SECRET
  // console.log(ACCESSID, "ACCESSID")
  // console.log(AWS_SECRET, "AWS_SECRET")


  mongoose.Promise = global.Promise;

  await mongoose.connect(MONGO_URI as string, {} as mongoose.ConnectOptions)

  const db = mongoose.connection;

  db.once('open', () => {
    console.log("connection established", MONGO_URI);
  });

  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });


}


