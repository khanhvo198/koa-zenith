import { GET, route } from "awilix-koa";
import { Context } from "koa";

@route("/")
export default class AuthController {
  @GET()
  async getDeckById(ctx: Context) {
    ctx.body = "Hello world";
  }
}
