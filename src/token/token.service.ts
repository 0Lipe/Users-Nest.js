import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private repository: Repository<Token>,
    private userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async findByUsername(username: string) {
    return this.repository.findOne({ where: { username } });
  }

  async save(hash: string, username: string) {
    let objToken = await this.repository.findOne({ where: { username } });
    if (objToken) {
      return await this.repository.update(objToken.id, { hash: hash });
    } else {
      this.repository.insert({
        hash: hash,
        username: username,
      });
    }
  }

  async refreshToken(oldToken: string) {
    let objToken = await this.repository.findOne({ where: { hash: oldToken } });
    if (objToken) {
      const user = await this.userService.findUserByName(objToken.username);
      return this.authService.signIn(user);
    }
    throw new UnauthorizedException('Token invalid');
  }
}
