import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  jwtCode: string;

  @IsString()
  newPassword: string;
}
