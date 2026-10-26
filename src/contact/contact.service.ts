import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAILY_LIMIT = 10;

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async reveal(requesterId: string, donorId: string) {
    if (!donorId || donorId.length > 40) throw new BadRequestException('Invalid donor id');

    const donor = await this.prisma.donor.findFirst({
      where: { id: donorId, isVisible: true },
      select: { user: { select: { phone: true } } },
    });
    if (!donor) throw new NotFoundException('Donor not found');

    const seenBefore = await this.prisma.contactReveal.findFirst({
      where: { requesterId, donorId },
      select: { id: true },
    });

    if (!seenBefore) {
      const lastDay = await this.prisma.contactReveal.count({
        where: { requesterId, createdAt: { gt: new Date(Date.now() - 24 * 60 * 60_000) } },
      });
      if (lastDay >= DAILY_LIMIT) {
        throw new HttpException('Daily contact limit reached. Try again tomorrow.', HttpStatus.TOO_MANY_REQUESTS);
      }
      await this.prisma.contactReveal.create({ data: { requesterId, donorId } });
    }

    return { phone: donor.user.phone };
  }
}