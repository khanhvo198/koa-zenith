import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const app = createApp();

app.listen(8080);
