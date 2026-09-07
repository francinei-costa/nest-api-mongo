import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './models/users.model';
import { AuthService } from './../auth/auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  public async signup(signupDto: SignupDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: signupDto.email,
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = new this.userModel(signupDto);
    return user.save();
  }

  public async signin(signinDto: SigninDto): Promise<{
    name: string | undefined;
    jwtToken: string;
    refreshToken: string;
    email: string | undefined;
  }> {
    const user = await this.findByEmail(signinDto.email);
    const match = await this.checkPassword(signinDto.password, user as User);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtToken = await this.authService.createAccessToken(
      user!._id.toString(),
    );
    const refreshToken = await this.authService.createRefreshToken(
      user!._id.toString(),
    );

    return {
      name: user?.name,
      email: user?.email,
      jwtToken,
      refreshToken,
    };
  }

  public async refresh(refreshToken: string): Promise<{
    jwtToken: string;
    refreshToken: string;
  }> {
    const payload = await this.authService.validateRefreshToken(refreshToken);
    const jwtToken = await this.authService.createAccessToken(payload.userId);
    const nextRefreshToken = await this.authService.createRefreshToken(
      payload.userId,
    );

    return {
      jwtToken,
      refreshToken: nextRefreshToken,
    };
  }

  public async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password');
  }

  private async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async checkPassword(password: string, user: User): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return isMatch;
  }
}
