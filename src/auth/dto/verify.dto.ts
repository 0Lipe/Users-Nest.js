import { IsEmail, IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;

  constructor(email: string, code: string) {
    (this.email = email), (this.code = code);
  }
}
