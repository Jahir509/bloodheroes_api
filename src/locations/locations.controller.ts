import { Controller, Get, Header, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('districts')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=86400')
  districts() {
    return this.locations.districts();
  }

  @Get(':id/upazilas')
  @Header('Cache-Control', 'public, max-age=86400')
  upazilas(@Param('id', ParseIntPipe) id: number) {
    return this.locations.upazilas(id);
  }
}