import { Controller, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ContactService } from './contact.service';

@ApiTags('contact')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('donors')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post(':id/contact')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  reveal(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) donorId: string) {
    return this.contact.reveal(userId, donorId);
  }
}