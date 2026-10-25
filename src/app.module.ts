import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
// import { AuthModule } from './auth/auth.module';
// import { LocationsModule } from './locations/locations.module';
// import { DonorsModule } from './donors/donors.module';
// import { SearchModule } from './search/search.module';
// import { ContactModule } from './contact/contact.module';
// import { MapModule } from './map/map.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // max 100 requests per minute per IP
    PrismaModule,
    // AuthModule,
    // LocationsModule,
    // DonorsModule,
    // SearchModule,
    // ContactModule,
    // MapModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }], // apply the limit everywhere
})
export class AppModule {}