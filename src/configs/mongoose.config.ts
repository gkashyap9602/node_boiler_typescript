import mongoose from "mongoose";
import { DB } from "../constants/app.constant";


const connection = () => {
  mongoose.connect(DB.MONGODB_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB.DBNAME,
  } as mongoose.ConnectOptions)
    .then(() => {
      console.log("Mongodb connected to " + DB.MONGODB_URI);
    })
    .catch((err: any) => {
      console.log(err, "Mongo Connection Error");
    });
}

const db = mongoose.connection;


// mongoose.connection.on("connected", function () {
//   console.info("connected to " + DB.DBNAME);
// });

// // If the connection throws an error
// mongoose.connection.on("error", function (err: any) {
//   console.info("DB connection error: " + err);
// });

// // When the connection is disconnected
// mongoose.connection.on("disconnected", function () {
//   console.info("DB connection disconnected");
// });

//This line sets up an event listener for the SIGINT signal emitted by the process when Ctrl + C is pressed.
// process.on("SIGINT", async () => {
//   await mongoose.connection.close();
//   process.exit(0);
// });
export default { connection, db }
