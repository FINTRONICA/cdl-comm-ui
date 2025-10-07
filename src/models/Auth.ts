import { Auth } from '../types/auth';

export class AuthModel {
  static create(): Auth {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      sessionTimeout: null
    };
  }
}
