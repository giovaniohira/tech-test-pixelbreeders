export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthTokens {
  access: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
