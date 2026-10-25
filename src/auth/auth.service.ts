import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeBdPhone } from '../common/phone';
import { SmsService } from './sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  private hash(code: string) {
    return createHash('sha256').update(code + this.config.getOrThrow<string>('JWT_SECRET')).digest('hex');
  }

  private phoneOrThrow(raw: string) {
    const phone = normalizeBdPhone(raw);
    if (!phone) throw new BadRequestException('Enter a valid Bangladeshi mobile number');
    return phone;
  }

  async requestOtp(rawPhone: string) {
    const phone = this.phoneOrThrow(rawPhone);

    const recent = await this.prisma.otpCode.count({
      where: { phone, createdAt: { gt: new Date(Date.now() - 10 * 60_000) } },
    });
    if (recent >= 3) {
      throw new HttpException('Too many codes. Try again in 10 minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = String(randomInt(100000, 1000000));
    await this.prisma.otpCode.create({
      data: { phone, codeHash: this.hash(code), expiresAt: new Date(Date.now() + 5 * 60_000) },
    });
    await this.sms.send(phone, `Your BloodHeroes code is ${code}`);

    return { phone, expiresInSeconds: 300 };
  }

  async verifyOtp(rawPhone: string, code: string) {
    const phone = this.phoneOrThrow(rawPhone);

    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.attempts >= 5) throw new UnauthorizedException('Code expired. Request a new one.');

    if (otp.codeHash !== this.hash(code)) {
      await this.prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw new UnauthorizedException('Wrong code');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
    const user = await this.prisma.user.upsert({ where: { phone }, update: {}, create: { phone } });
    const accessToken = await this.jwt.signAsync({ sub: user.id });

    return { accessToken, user: { id: user.id, phone: user.phone } };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, donor: { select: { id: true } } },
    });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, phone: user.phone, isDonor: Boolean(user.donor) };
  }
}