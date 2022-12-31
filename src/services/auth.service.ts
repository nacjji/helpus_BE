import AuthRepository from '../repositories/auth.repository';

class AuthService {
  authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }
}

export default AuthService;
