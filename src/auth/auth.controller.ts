import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthResult } from './dto/auth-result.dto';
import { VerifyCodeDto } from './dto/verify.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from './auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { extractToken } from './ults/auth.extract';
import { emailDto } from './dto/email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() input: AuthDto): Promise<AuthResult> {
    return this.authService.authenticate(input);
  }

  @Post('verify')
  async verify(@Body() VerifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(VerifyCodeDto);
  }

  @Post('resend-verify')
  async sendVerify(@Body() emailDto: emailDto) {
    return this.authService.sendCode(emailDto);
  }

  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.authService.changePassword(
      req.id,
      changePasswordDto.newPassword,
      changePasswordDto.oldPassword,
    );
  }

  @UseGuards(AuthGuard)
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() request,
  ) {
    const token = extractToken(request);
    return this.authService.forgotPassword(forgotPasswordDto, token);
  }
}
