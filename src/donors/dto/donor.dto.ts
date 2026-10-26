import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsPositive, IsString, Length, MaxLength } from 'class-validator';
import { BLOOD_GROUPS, GENDERS, type BloodGroupKey, type GenderKey } from '../../common/blood-groups';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpsertDonorDto {
  @Transform(trim)
  @IsString()
  @Length(2, 80)
  fullName!: string;

  @IsIn(BLOOD_GROUPS)
  bloodGroup!: BloodGroupKey;

  @IsIn(GENDERS)
  gender!: GenderKey;

  @IsInt()
  @IsPositive()
  upazilaId!: number;

  /** e.g. "near Savar bus stand" */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  areaNote?: string;

  /** YYYY-MM-DD. Leave out if never donated. */
  @IsOptional()
  @IsDateString()
  lastDonatedAt?: string;
}

export class UpdateStatusDto {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}