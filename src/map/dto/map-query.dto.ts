import { IsIn } from 'class-validator';
import { BLOOD_GROUPS, type BloodGroupKey } from '../../common/blood-groups';

export class MapQueryDto {
  @IsIn(BLOOD_GROUPS)
  group!: BloodGroupKey;
}