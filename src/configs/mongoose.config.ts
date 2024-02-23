import mongoose from "mongoose";
import { DB } from "../constants/index";

mongoose
  .connect(DB.MONGODB_URI as string, {
    dbName: DB.DBNAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb connected to " + DB.MONGODB_URI);
  })
  .catch((err: any) => {
    console.log(err, "Mongo Connection Error");
  });

  
mongoose.connection.on("connected", function () {
  console.info("connected to " + DB.DBNAME);
});

// If the connection throws an error
mongoose.connection.on("error", function (err: any) {
  console.info("DB connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
  console.info("DB connection disconnected");
});

//This line sets up an event listener for the SIGINT signal emitted by the process when Ctrl + C is pressed.
// process.on("SIGINT", async () => {
//   await mongoose.connection.close();
//   process.exit(0);
// });
