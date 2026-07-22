import { IsNotEmpty, IsString } from 'class-validator';

export class RejectAccountDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
