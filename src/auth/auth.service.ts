import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto/signIn.dto';
import * as bcrypt from 'bcrypt';
import { AuthResult } from './dto/auth-result.dto';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { sendEmailDto } from 'src/email/dto/email.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/User.entity';
import { Repository } from 'typeorm';
import { VerifyCodeDto } from './dto/verify.dto';
import { generateRandomCode } from './ults/code';
import { passwordCrypt } from './ults/password';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TokenService } from 'src/token/token.service';
import { emailDto } from './dto/email.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly sendEmail: EmailService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private tokenService: TokenService,
  ) {}

  async authenticate(input: AuthDto): Promise<AuthResult> {
    const user = await this.validateUser(input);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.signIn(user);
  }

  async validateUser(input: AuthDto): Promise<SignInDto | null> {
    const user = await this.userService.findUserByName(input.username);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (user && isMatch) {
      return {
        id: user.id,
        username: user.username,
      };
    }
    return null;
  }

  async signIn(user: SignInDto): Promise<AuthResult> {
    const userValid = await this.usersRepository.findOneBy({ id: user.id });

    if (!userValid) {
      throw new NotFoundException('User not found');
    }

    if (!userValid.isActive) {
      throw new UnauthorizedException();
    }
    const tokenPayload = {
      sub: user.id,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    await this.tokenService.save(accessToken, user.username);
    return { accessToken, username: user.username, userId: user.id };
  }

  async sendCode(emailDto: emailDto) {
    const { email } = emailDto;
    const code = await this.newCode(email);
    const dto = new sendEmailDto(
      email,
      'Verification',
      `<p>Your verification code is: <strong>${code}</strong></p>`,
    );
    await this.sendEmail.sendEmail(dto);
    return;
  }

  async newCode(email: string): Promise<string> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newCode = generateRandomCode(6);
    user.code = newCode;
    await this.usersRepository.save(user);
    return newCode;
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<string> {
    const { email, code } = verifyCodeDto;

    const user = await this.usersRepository.findOneBy({ email });
    console.log(user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.code !== code) {
      throw new BadRequestException('Wrong code');
    }

    user.isActive = true;
    user.code = null;
    await this.usersRepository.save(user);

    const tokenPayload = {
      sub: user.id,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    await this.tokenService.save(accessToken, user.username);
    return accessToken;
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const newHashPassword = await passwordCrypt(newPassword);
    user.password = newHashPassword;
    await this.usersRepository.save(user);
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    Reqtoken: string | null,
  ) {
    const { email, newPassword } = forgotPasswordDto;

    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.tokenService.findByUsername(user.username);
    if (!token) throw new UnauthorizedException();
    if (!Reqtoken) throw new Error('Token not found');

    const userDecoded = await this.jwtService.verify(Reqtoken);
    if (!userDecoded) throw new UnauthorizedException();
    console.log(token.hash);
    console.log(Reqtoken);
    if (token.hash !== Reqtoken) {
      throw new UnauthorizedException("Token don't match");
    }

    if (user.username !== userDecoded.username) {
      throw new UnauthorizedException("You can't delete this user");
    }
    const newPasswordHash = await passwordCrypt(newPassword);

    user.password = newPasswordHash;
    await this.usersRepository.save(user);
  }
}
