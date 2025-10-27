import dotenv from "dotenv";
import { createApp } from "./app";

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
