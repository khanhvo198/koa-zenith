import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

export default class SecurityService {
  private _secretKey: jwt.Secret;

  constructor() {
    this._secretKey = process.env.SECRET_KEY as jwt.Secret;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async comparePassword(
    candidatePassword: string,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, password);
  }

  verifyToken(token: string): string | jwt.JwtPayload {
    return jwt.verify(token, this._secretKey);
  }

  generateToken(id: string): string {
    return jwt.sign({ user: { id } }, this._secretKey, {
      expiresIn: 24 * 60 * 60 * 30,
    });
  }
}
