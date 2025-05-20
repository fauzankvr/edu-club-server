export interface IGoogleAuthService {
  verifyToken(token: string): Promise<{
    googleId: string;
    email: string;
    name: string;
    picture: string;
  }>;
}
