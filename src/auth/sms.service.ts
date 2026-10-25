import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async send(to: string, message: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`📱 SMS to ${to}: ${message}`);
      return;
    }
    // Production: call your SMS gateway's HTTP API here (e.g. SSL Wireless, BulkSMSBD)
    throw new Error('SMS gateway not configured');
  }
}