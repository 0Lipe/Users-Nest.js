import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class sendEmailDto {
  @IsNotEmpty()
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsOptional()
  @IsString()
  text?: string;

  constructor(email, subject, html) {
    (this.recipients = email), (this.subject = subject), (this.html = html);
  }
}
