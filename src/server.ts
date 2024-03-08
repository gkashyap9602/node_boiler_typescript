import morgan from "morgan";
import express, { Application } from "express";
import bodyParser from "body-parser";
import path from 'path'
import cors from "cors";
import helmet from "helmet";
import { serve, setup } from "swagger-ui-express";
import Routes from "./routes";
import { bootstrapAdmin } from "./utils/bootstrap.util";
import { rateLimiter } from "./utils/common.util";
import { APP, AWS_CREDENTIAL } from './constants/app.constant' //priority 1
require('../src/configs/mongoose.config') //priority 2
const app: Application = express();

app.use(helmet())

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", 1);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,authtoken"
  );
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, }));
app.use(morgan("tiny"));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/files", express.static(__dirname + "/public/uploads"));

app.use(rateLimiter); //limit the api hit with specific ip

app.use("/swagger", serve,
  setup(undefined, {
    swaggerOptions: {
      url: "/swagger/swagger.json",
    },

  })
);


app.use("/api", Routes);
bootstrapAdmin(() => {
  console.log("Bootstraping finished!");
});

app.listen(APP.PORT, () => {
  console.log("Server is running on port", APP.PORT);
  console.log("swagger link ", `localhost:${APP.PORT}/swagger`);
});




