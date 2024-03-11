import mongoose from "mongoose";
import { DB } from "../constants/app.constant";

export const connection = async () => {
  let MONGO_URI = await DB.MONGODB_URI

  console.log(MONGO_URI, "MONGO_URI_CONNECTION_SIDE")

  mongoose.connect(MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: await DB.DB_NAME,
  } as mongoose.ConnectOptions)
    .then(() => {
      console.log("Mongodb connected to " + MONGO_URI);
    })
    .catch((err: any) => {
      console.log(err, "Mongo Connection Error");
    });
}


// export = { connection }

