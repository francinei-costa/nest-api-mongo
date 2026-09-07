import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let authService: {
    createAccessToken: jest.Mock;
    createRefreshToken: jest.Mock;
  };

  const userModel = jest.fn((dto: Record<string, unknown>) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({
      ...dto,
      _id: 'new-user-id',
    }),
  })) as jest.Mock & {
    findOne: jest.Mock;
    find: jest.Mock;
  };

  userModel.findOne = jest.fn();
  userModel.find = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    authService = {
      createAccessToken: jest.fn().mockResolvedValue('jwt-token'),
      createRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
    };
    service = new UsersService(userModel as never, authService as never);
  });

  it('should create a new user when the email is available', async () => {
    userModel.findOne.mockResolvedValue(null);

    const result = await service.signup({
      name: 'Maria',
      email: 'maria@email.com',
      password: '123456',
    });

    expect(result).toMatchObject({
      name: 'Maria',
      email: 'maria@email.com',
      password: '123456',
      _id: 'new-user-id',
    });
  });

  it('should throw when trying to create a user that already exists', async () => {
    userModel.findOne.mockResolvedValue({ email: 'maria@email.com' });

    await expect(
      service.signup({
        name: 'Maria',
        email: 'maria@email.com',
        password: '123456',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should sign in a user with valid credentials and return an access and refresh token', async () => {
    const user = {
      _id: 'user-123',
      name: 'Maria',
      email: 'maria@email.com',
      password: 'hashed-password',
    };

    userModel.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.signin({
      email: 'maria@email.com',
      password: '123456',
    });

    expect(authService.createAccessToken).toHaveBeenCalledWith('user-123');
    expect(result).toMatchObject({
      name: 'Maria',
      email: 'maria@email.com',
      jwtToken: 'jwt-token',
    });
    expect(typeof result.refreshToken).toBe('string');
  });

  it('should reject sign in when credentials are invalid', async () => {
    const user = {
      _id: 'user-123',
      name: 'Maria',
      email: 'maria@email.com',
      password: 'hashed-password',
    };

    userModel.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.signin({
        email: 'maria@email.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
