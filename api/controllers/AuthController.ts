import { PrismaClient } from "@prisma/client";
import { POST, route } from "awilix-koa";
import { Context } from "koa";
import { StatusCodes } from "http-status-codes";
import SecurityService from "../services/SercurityService";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

@route("/auth")
export default class AuthController {
  private _prisma: PrismaClient;
  private _securityService: SecurityService;

  constructor({
    prisma,
    securityService,
  }: {
    prisma: PrismaClient;
    securityService: SecurityService;
  }) {
    this._prisma = prisma;
    this._securityService = securityService;
  }

  @POST()
  @route("/login")
  async login(ctx: Context) {
    const { email, password } = ctx.request.body as LoginRequest;

    const user = await this._prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      ctx.throw(StatusCodes.UNAUTHORIZED);
    }

    if (
      !(await this._securityService.comparePassword(password, user.password))
    ) {
      console.log("hahah");
      ctx.throw(StatusCodes.UNAUTHORIZED);
    }

    const token = this._securityService.generateToken(user.id);

    ctx.body = {
      email: user.email,
      name: user.name,
      token,
    };
  }

  @POST()
  @route("/register")
  async register(ctx: Context) {
    const { email, password, name } = ctx.request.body as RegisterRequest;

    const hashPassword = await this._securityService.hashPassword(password);

    const newUser = await this._prisma.user.create({
      data: {
        email,
        name,
        password: hashPassword,
      },
    });

    const token = this._securityService.generateToken(newUser.id);

    ctx.body = {
      email,
      name,
      token,
    };
  }
}
