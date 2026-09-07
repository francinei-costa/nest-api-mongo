import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from './models/users.model';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { UsersService } from './users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SigninResponseDto } from './dto/signin-response.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { UsersListResponseDto } from './dto/users-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso' })
  @ApiBody({ type: SignupDto })
  public async signup(@Body() signupDto: SignupDto): Promise<User> {
    return this.usersService.signup(signupDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza login e gera tokens JWT e refresh' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({ type: SigninResponseDto })
  public async signin(
    @Body() signinDto: SigninDto,
  ): Promise<SigninResponseDto> {
    return this.usersService.signin(signinDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renova o token de acesso usando refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens renovados com sucesso' })
  @ApiBody({ type: RefreshTokenDto })
  public async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    jwtToken: string;
    refreshToken: string;
  }> {
    return this.usersService.refresh(refreshTokenDto.refreshToken);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista usuários autenticados' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuários',
    type: UsersListResponseDto,
  })
  public async findAll(
    @Query() query: UsersQueryDto,
  ): Promise<UsersListResponseDto> {
    return this.usersService.findAll(query);
  }
}
