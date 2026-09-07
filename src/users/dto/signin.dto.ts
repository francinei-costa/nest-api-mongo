import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SigninDto {
  @ApiProperty({
    example: 'joao@email.com',
    description: 'E-mail cadastrado do usuário',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    minLength: 4,
    description: 'Senha cadastrada do usuário',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password!: string;
}
