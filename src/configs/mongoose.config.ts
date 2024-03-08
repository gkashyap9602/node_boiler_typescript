import mongoose from "mongoose";
import { DB } from "../constants/app.constant";
import { AWS_CREDENTIAL } from "../constants/app.constant";

const connection = async () => {
  // console.log(AWS_CREDENTIAL.ACCESSID, "AWS_MONGO_URI")
  let MONGO_URI = await AWS_CREDENTIAL.MONGO_URI
  console.log(MONGO_URI,"MONGO_URI")
  mongoose.connect(MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: await AWS_CREDENTIAL.DB_NAME,
  } as mongoose.ConnectOptions)
    .then(() => {
      console.log("Mongodb connected to " + DB.MONGODB_URI);
    })
    .catch((err: any) => {
      console.log(err, "Mongo Connection Error");
    });
}

connection()

