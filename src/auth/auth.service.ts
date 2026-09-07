import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { sign, verify } from 'jsonwebtoken';
import { User } from '../users/models/users.model';
import { JwtPayload } from './models/jwt-payload.model';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async createAccessToken(userId: string): Promise<string> {
    return sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET || 'default-secret',
      {
        expiresIn: '1h',
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async createRefreshToken(userId: string): Promise<string> {
    return sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET ||
        process.env.JWT_SECRET ||
        'default-secret',
      {
        expiresIn: '7d',
      },
    );
  }

  public async validateUser(jwtPayload: JwtPayload): Promise<User | null> {
    if (jwtPayload.type && jwtPayload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userModel.findOne({ _id: jwtPayload.userId });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  public validateRefreshToken(refreshToken: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      try {
        const payload = verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET ||
            process.env.JWT_SECRET ||
            'default-secret',
        ) as JwtPayload;

        if (!payload.userId || payload.type !== 'refresh') {
          reject(new UnauthorizedException('Invalid refresh token'));
          return;
        }

        resolve(payload);
      } catch {
        reject(new UnauthorizedException('Invalid or expired refresh token'));
      }
    });
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
