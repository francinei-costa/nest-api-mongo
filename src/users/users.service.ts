import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './models/users.model';
import { AuthService } from './../auth/auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  public async signup(signupDto: SignupDto): Promise<User> {
    const user = new this.userModel(signupDto);
    return user.save();
  }

  public async signin(signinDto: SigninDto): Promise<{
    name: string | undefined;
    jwtToken: string;
    email: string | undefined;
  }> {
    const user = await this.findByEmail(signinDto.email);
    const match = await this.checkPassword(signinDto.password, user as User);

    if (!match) {
      throw new NotFoundException('Invalid credentials');
    }
    const jwtToken = await this.authService.createAccessToken(
      user!._id.toString(),
    );

    return {
      name: user?.name,
      email: user?.email,
      jwtToken,
    };
  }

  public async findAll(): Promise<User[]> {
    return this.userModel.find();
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
      throw new NotFoundException('Password not found');
    }
    return isMatch;
  }
}
