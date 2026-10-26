import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  districts() {
    return this.prisma.district.findMany({
      select: { id: true, name: true, nameBn: true },
      orderBy: { name: 'asc' },
    });
  }

  async upazilas(districtId: number) {
    try {
      return await this.prisma.upazila.findMany({
        where: { districtId },
        select: { id: true, name: true, nameBn: true, districtId: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new NotFoundException('Wrong District Code/ No Upazila Found for this District');
    }
  }
}
