import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SingInDto } from './dto/singInData.dto';
import * as bcrypt from 'bcrypt';
import { AuthResult } from './dto/auth-result.dto';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async authenticate(input: AuthDto): Promise<AuthResult> {
    const user = await this.validateUser(input);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.singIn(user);
  }

  async validateUser(input: AuthDto): Promise<SingInDto | null> {
    const user = await this.userService.findUserByName(input.username);
    const isMatch = await bcrypt.compare(input.password, user.password);
    if (user && isMatch) {
      return {
        userId: user.id,
        username: user.username,
      };
    }
    return null;
  }
  async singIn(user: SingInDto): Promise<AuthResult> {
    const tokenPayload = {
      sub: user.userId,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return { accessToken, username: user.username, userId: user.userId };
  }
}
