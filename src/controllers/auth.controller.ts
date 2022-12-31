import AuthService from '../services/auth.service';

class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
}

export default AuthController;
