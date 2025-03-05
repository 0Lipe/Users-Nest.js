import { IsEmail } from 'class-validator';

export class emailDto {
  @IsEmail()
  email: string;

  constructor(email) {
    this.email = email;
  }
}
