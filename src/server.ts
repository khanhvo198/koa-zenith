import { createApp } from "./app";
import dotenv from "dotenv";

import Koa from "koa";

const startServer = async () => {
  try {
    dotenv.config();

    const app: Koa = await createApp();
    app.listen(8080);
  } catch (error) {
    console.log(error);
  }
};

startServer();
