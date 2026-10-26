import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { BLOOD_GROUPS, type BloodGroupKey } from '../../common/blood-groups';

export class SearchQueryDto {
  @Type(() => Number) // query strings arrive as text; turn them into numbers
  @IsInt()
  @IsPositive()
  upazila!: number;

  @IsIn(BLOOD_GROUPS)
  group!: BloodGroupKey;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  page: number = 1;
}