import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { sign, verify } from 'jsonwebtoken';
import { User } from '../users/models/users.model';
import { JwtPayload } from './models/jwt-payload.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @Inject('CONFIG_SERVICE') private readonly configService: ConfigService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async createAccessToken(userId: string): Promise<string> {
    return sign(
      { userId, type: 'access' },
      this.configService.getOrThrow<string>('JWT_SECRET'),
      {
        expiresIn: '1h',
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async createRefreshToken(userId: string): Promise<string> {
    return sign(
      { userId, type: 'refresh' },
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
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
          this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
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
