import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/models/users.model';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { Request } from 'express';
import { JwtPayload } from './models/jwt-payload.model';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async createAccessToken(userId: string): Promise<string> {
    return sign({ userId }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: '1d',
    });
  }

  public async validateUser(jwtPayload: JwtPayload): Promise<User | null> {
    const user = await this.userModel.findOne({ _id: jwtPayload.userId });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  public returnJwtExtractor(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new BadRequestException('Authorization header is required');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new BadRequestException('Invalid authorization format');
    }

    return token;
  }
}
