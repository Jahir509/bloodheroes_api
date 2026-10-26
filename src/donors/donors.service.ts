import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isEligibleNow, nextEligibleDate } from '../common/eligibility';
import { UpdateStatusDto, UpsertDonorDto } from './dto/donor.dto';

// What we return for "my profile" (the owner may see everything about themselves)
const donorSelect = {
  id: true,
  fullName: true,
  bloodGroup: true,
  gender: true,
  areaNote: true,
  lastDonatedAt: true,
  isAvailable: true,
  isVisible: true,
  upazila: { select: { id: true, name: true, district: { select: { id: true, name: true } } } },
  _count: { select: { reveals: true } },
} satisfies Prisma.DonorSelect;

type DonorRow = Prisma.DonorGetPayload<{ select: typeof donorSelect }>;

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  private present({ _count, ...donor }: DonorRow) {
    return {
      ...donor,
      revealCount: _count.reveals, // how many times their number was shown
      eligibleNow: donor.isAvailable && isEligibleNow(donor.lastDonatedAt, donor.gender),
      nextEligibleAt: nextEligibleDate(donor.lastDonatedAt, donor.gender),
    };
  }

  private async ensureExists(userId: string) {
    const found = await this.prisma.donor.findUnique({ where: { userId }, select: { id: true } });
    if (!found) throw new NotFoundException('Create your donor profile first');
  }

  async getMine(userId: string) {
    const donor = await this.prisma.donor.findUnique({ where: { userId }, select: donorSelect });
    return { donor: donor ? this.present(donor) : null };
  }

  async upsert(userId: string, dto: UpsertDonorDto) {
    const upazilaExists = await this.prisma.upazila.count({ where: { id: dto.upazilaId } });
    if (!upazilaExists) throw new BadRequestException('Unknown upazila');

    const lastDonatedAt = dto.lastDonatedAt ? new Date(dto.lastDonatedAt) : null;
    if (lastDonatedAt && lastDonatedAt > new Date()) {
      throw new BadRequestException("Last donation date can't be in the future");
    }

    const data = {
      fullName: dto.fullName,
      bloodGroup: dto.bloodGroup,
      gender: dto.gender,
      upazilaId: dto.upazilaId,
      areaNote: dto.areaNote || null,
      lastDonatedAt,
    };

    const donor = await this.prisma.donor.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
      select: donorSelect,
    });
    return this.present(donor);
  }

  async updateStatus(userId: string, dto: UpdateStatusDto) {
    await this.ensureExists(userId);
    const donor = await this.prisma.donor.update({ where: { userId }, data: dto, select: donorSelect });
    return this.present(donor);
  }

  async recordDonation(userId: string) {
    await this.ensureExists(userId);
    const donor = await this.prisma.donor.update({
      where: { userId },
      data: { lastDonatedAt: new Date() },
      select: donorSelect,
    });
    return this.present(donor);
  }

  async remove(userId: string) {
    await this.ensureExists(userId);
    await this.prisma.donor.delete({ where: { userId } }); // reveal logs go with it (cascade)
  }
}