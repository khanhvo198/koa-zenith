import { PrismaClient } from "@prisma/client";
import { IncomingHttpHeaders } from "http";
import { StatusCodes } from "http-status-codes";
import { Context, Next } from "koa";
import SecurityService from "../services/SercurityService";

export default function AuthenticationMiddleware({
  prisma,
  securityService,
}: {
  prisma: PrismaClient;
  securityService: SecurityService;
}) {
  return async function (ctx: Context, next: Next) {
    const { authorization }: IncomingHttpHeaders = ctx.header;

    console.log(authorization);

    if (!authorization) {
      ctx.throw(StatusCodes.UNAUTHORIZED);
    }

    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Token" && tokenType !== "Bearer") {
      ctx.throw(StatusCodes.UNAUTHORIZED);
    }

    let claims: any;
    try {
      claims = securityService.verifyToken(token);
    } catch (e) {
      ctx.throw(StatusCodes.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: claims.user.id,
      },
    });

    if (!user) {
      ctx.throw(StatusCodes.UNAUTHORIZED);
    }

    ctx.state.user = user;

    return next();
  };
}
