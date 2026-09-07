import { ApiProperty } from '@nestjs/swagger';

export class UsersListResponseDto {
  @ApiProperty({ type: [Object] })
  data!: object[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}
