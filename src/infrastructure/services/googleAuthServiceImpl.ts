// services/googleAuthServiceImpl.ts
import { OAuth2Client } from "google-auth-library";
import { IGoogleAuthService } from "../../application/interface/IGoogleService";

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  googleId: string;
}

export class GoogleAuthServiceImpl implements IGoogleAuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async  verifyToken(token: string): Promise<GoogleUser>{
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google token");

    return {
      googleId: payload.sub!,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture!,
    };
  }
}
