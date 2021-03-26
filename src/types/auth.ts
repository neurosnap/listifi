export interface LoginLocalParams {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  clientId: string;
}

export interface TokenResponse {
  token: string;
}
