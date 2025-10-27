import dotenv from "dotenv";
import { createApp } from "./app";

const startServer = async () => {
  try {
    dotenv.config();

    await createApp();
  } catch (error) {
    console.log(error);
  }
};

export default startServer;
