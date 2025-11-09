import { PartialType } from '@nestjs/swagger';
import { CreateTodaysSpecialDto } from './create-todays-special.dto';

export class UpdateTodaysSpecialDto extends PartialType(CreateTodaysSpecialDto) {}
