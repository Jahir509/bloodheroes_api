import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  /** Bangladeshi mobile number, e.g. 01712345678 */
  @IsString()
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  phone!: string;

  /** The 6-digit code */
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code!: string;
}