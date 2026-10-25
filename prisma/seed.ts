import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// ---- Change these to match your GeoJSON property names (step 5.2) ----
const DISTRICT = { code: 'ADM2_PCODE', name: 'ADM2_EN', name_bn: 'ADM2_BN', division: 'ADM1_EN' };
const UPAZILA = { code: 'ADM3_PCODE', name: 'ADM3_EN', name_bn: 'ADM3_BN', districtCode: 'ADM2_PCODE' };
// -----------------------------------------------------------------------

type Feature = { properties: Record<string, unknown>; geometry: unknown };

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const load = (file: string): Feature[] => JSON.parse(readFileSync(file, 'utf8')).features;
const text = (v: unknown) => (v === undefined || v === null ? null : String(v).trim());

async function seedDistricts() {
  const features = load('prisma/data/districts.geojson');
  for (const f of features) {
    const p = f.properties;
    await prisma.$executeRaw`
      INSERT INTO districts (code, name, name_bn, division, geom)
      VALUES (
        ${text(p[DISTRICT.code])}, ${text(p[DISTRICT.name])}, ${text(p[DISTRICT.name_bn])}, ${text(p[DISTRICT.division])},
        ST_Multi(ST_CollectionExtract(ST_MakeValid(
          ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(f.geometry)}), 4326)), 3))
      )
      ON CONFLICT (code) DO UPDATE
        SET name = EXCLUDED.name, name_bn = EXCLUDED.name_bn, division = EXCLUDED.division, geom = EXCLUDED.geom`;
  }
  console.log(`Districts loaded: ${features.length}`);
}

async function seedUpazilas() {
  const features = load('prisma/data/upazilas.geojson');
  let skipped = 0;
  for (const f of features) {
    const p = f.properties;
    const inserted = await prisma.$executeRaw`
      INSERT INTO upazilas (code, name, name_bn, district_id, geom)
      SELECT
        ${text(p[UPAZILA.code])}, ${text(p[UPAZILA.name])}, ${text(p[UPAZILA.name_bn])}, d.id,
        ST_Multi(ST_CollectionExtract(ST_MakeValid(
          ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(f.geometry)}), 4326)), 3))
      FROM districts d
      WHERE d.code = ${text(p[UPAZILA.districtCode])}
      ON CONFLICT (code) DO UPDATE
        SET name = EXCLUDED.name, name_bn = EXCLUDED.name_bn, district_id = EXCLUDED.district_id, geom = EXCLUDED.geom`;
    if (inserted === 0) {
      skipped++;
      console.warn(`No district for upazila ${text(p[UPAZILA.name])} (${text(p[UPAZILA.districtCode])})`);
    }
  }
  console.log(`Upazilas loaded: ${features.length - skipped}, skipped: ${skipped}`);
}

async function simplify() {
  // Lighter boundaries for the web map (~500 m for districts, ~100 m for upazilas)
  await prisma.$executeRaw`UPDATE districts SET geom_simple = ST_Multi(ST_SimplifyPreserveTopology(geom, 0.005))`;
  await prisma.$executeRaw`UPDATE upazilas SET geom_simple = ST_Multi(ST_SimplifyPreserveTopology(geom, 0.001))`;
  console.log('Simplified boundaries ready');
}

async function main() {
  await seedDistricts();
  await seedUpazilas();
  await simplify();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());