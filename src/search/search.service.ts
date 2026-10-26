
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isEligibleNow, nextEligibleDate } from '../common/eligibility';
import { SearchQueryDto } from './dto/search-query.dto';

const PAGE_SIZE = 20;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search({ upazila, group, page }: SearchQueryDto) {
    const place = await this.prisma.upazila.findUnique({
      where: { id: upazila },
      select: { id: true, name: true, district: { select: { id: true, name: true } } },
    });
    if (!place) throw new NotFoundException('Upazila not found');

    const where = { upazilaId: upazila, bloodGroup: group, isVisible: true };

    const [rows, total] = await Promise.all([
      this.prisma.donor.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          gender: true,
          areaNote: true,
          isAvailable: true,
          lastDonatedAt: true, // no phone here, on purpose
        },
        orderBy: [{ isAvailable: 'desc' }, { lastDonatedAt: { sort: 'asc', nulls: 'first' } }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.donor.count({ where }),
    ]);

    return {
      place,
      group,
      page,
      pageSize: PAGE_SIZE,
      total,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      donors: rows.map(({ gender, lastDonatedAt, ...d }) => ({
        ...d,
        eligibleNow: d.isAvailable && isEligibleNow(lastDonatedAt, gender),
        nextEligibleAt: nextEligibleDate(lastDonatedAt, gender),
      })),
    };
  }
}