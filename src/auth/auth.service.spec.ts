import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const userModel: { findOne: jest.Mock } = {
    findOne: jest.fn(),
  };
  const configService = {
    getOrThrow: jest.fn((key: string) =>
      key === 'JWT_REFRESH_SECRET' ? 'test-refresh-secret' : 'test-secret',
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    service = new AuthService(userModel as never, configService as never);
  });

  it('should create a JWT token for a valid user id', async () => {
    const token = await service.createAccessToken('user-123');

    expect(token).toEqual(expect.any(String));
    expect(decode(token)).toMatchObject({ userId: 'user-123' });
  });

  it('should create a refresh token for a valid user id', async () => {
    const token = await service.createRefreshToken('user-123');

    expect(token).toEqual(expect.any(String));
    expect(decode(token)).toMatchObject({ userId: 'user-123' });
  });

  it('should extract the JWT from the Authorization header', () => {
    const request = {
      headers: {
        authorization: 'Bearer test-token',
      },
    } as unknown as Request;

    expect(service.returnJwtExtractor(request)).toBe('test-token');
  });

  it('should throw when Authorization header is missing', () => {
    const request = {
      headers: {},
    } as unknown as Request;

    expect(() => service.returnJwtExtractor(request)).toThrow(
      BadRequestException,
    );
  });

  it('should validate an existing user', async () => {
    const user = {
      _id: 'user-123',
      name: 'João',
      email: 'joao@email.com',
      password: 'hashed-password',
    };

    userModel.findOne.mockResolvedValue(user);

    await expect(service.validateUser({ userId: 'user-123' })).resolves.toEqual(
      user,
    );
  });

  it('should throw when a user is not found for the JWT payload', async () => {
    userModel.findOne.mockResolvedValue(null);

    await expect(
      service.validateUser({ userId: 'missing-user' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
