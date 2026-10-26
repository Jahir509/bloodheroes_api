import { Injectable, NotFoundException } from '@nestjs/common';
import type { FeatureCollection } from 'geojson';
import { PrismaService } from '../prisma/prisma.service';
import type { BloodGroupKey } from '../common/blood-groups';

type Row = { fc: FeatureCollection };

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async districts(group: BloodGroupKey) {
    const rows = await this.prisma.$queryRaw<Row[]>`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(d.geom_simple, 5)::json,
          'properties', json_build_object('id', d.id, 'name', d.name, 'donors', COALESCE(c.n, 0))
        )), '[]'::json)
      ) AS fc
      FROM districts d
      LEFT JOIN (
        SELECT u.district_id, COUNT(*)::int AS n
        FROM donors dn
        JOIN upazilas u ON u.id = dn.upazila_id
        WHERE dn.blood_group = ${group}::"BloodGroup" AND dn.is_visible
        GROUP BY u.district_id
      ) c ON c.district_id = d.id`;
    return rows[0].fc;
  }

  async upazilas(districtId: number, group: BloodGroupKey) {
    const exists = await this.prisma.district.count({ where: { id: districtId } });
    if (!exists) throw new NotFoundException('District not found');

    const rows = await this.prisma.$queryRaw<Row[]>`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(u.geom_simple, 5)::json,
          'properties', json_build_object('id', u.id, 'name', u.name, 'donors', COALESCE(c.n, 0))
        )), '[]'::json)
      ) AS fc
      FROM upazilas u
      LEFT JOIN (
        SELECT upazila_id, COUNT(*)::int AS n
        FROM donors
        WHERE blood_group = ${group}::"BloodGroup" AND is_visible
        GROUP BY upazila_id
      ) c ON c.upazila_id = u.id
      WHERE u.district_id = ${districtId}`;
    return rows[0].fc;
  }
}