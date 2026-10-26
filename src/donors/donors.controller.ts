import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { DonorsService } from './donors.service';
import { UpdateStatusDto, UpsertDonorDto } from './dto/donor.dto';

@ApiTags('donors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('donors/me')
export class DonorsController {
  constructor(private readonly donors: DonorsService) {}

  @Get()
  getMine(@CurrentUserId() userId: string) {
    return this.donors.getMine(userId);
  }

  @Put()
  upsert(@CurrentUserId() userId: string, @Body() dto: UpsertDonorDto) {
    return this.donors.upsert(userId, dto);
  }

  @Patch('status')
  updateStatus(@CurrentUserId() userId: string, @Body() dto: UpdateStatusDto) {
    return this.donors.updateStatus(userId, dto);
  }

  @Post('donations')
  @HttpCode(200)
  recordDonation(@CurrentUserId() userId: string) {
    return this.donors.recordDonation(userId);
  }

  @Delete()
  @HttpCode(204)
  remove(@CurrentUserId() userId: string) {
    return this.donors.remove(userId);
  }
}