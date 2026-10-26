import { Controller, Get, Header, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MapService } from './map.service';
import { MapQueryDto } from './dto/map-query.dto';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly map: MapService) {}

  @Get('districts')
  @Header('Cache-Control', 'public, max-age=60') // counts may be up to 1 minute old
  districts(@Query() { group }: MapQueryDto) {
    return this.map.districts(group);
  }

  @Get('districts/:id/upazilas')
  @Header('Cache-Control', 'public, max-age=60')
  upazilas(@Param('id', ParseIntPipe) id: number, @Query() { group }: MapQueryDto) {
    return this.map.upazilas(id, group);
  }
}