import dotenv from "dotenv";
import serverless from "serverless-http";
import { createApp } from "./app";

// const startServer = async () => {
//   try {
//     dotenv.config();
//
//     const app: Koa = await createApp();
//
//     app.listen(8080);
//   } catch (error) {
//     console.log(error);
//   }
// };
//
// startServer();
//

dotenv.config();

const app = createApp();

app.listen(8080);

export default serverless(app);
