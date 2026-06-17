import {
  BadRequestException, ForbiddenException,
  Injectable, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Регистрация ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing && !existing.isDeleted) {
      throw new BadRequestException('Email already in use');
    }
    if (existing?.isDeleted) {
      throw new BadRequestException('Account deleted. Use /auth/restore to recover it.');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create(dto.email, hashed);
    return this.issueTokens(user.id, user.email);
  }

  // ── Вход ─────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isDeleted) throw new ForbiddenException('Account is deleted. Use /auth/restore.');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email);
  }

  // ── Выход ─────────────────────────────────────────────────────
  async logout(userId: string) {
    await this.users.updateRefreshToken(userId, null);
  }

  // ── Обновление токенов ────────────────────────────────────────
  async refresh(userId: string, email: string, refreshToken: string) {
    const user = await this.users.findById(userId);
    if (!user || !user.refreshToken) throw new ForbiddenException('Access denied');
    const match = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!match) throw new ForbiddenException('Access denied');
    return this.issueTokens(user.id, user.email);
  }

  // ── Профиль ───────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  // ── Soft Delete ───────────────────────────────────────────────
  async deleteAccount(userId: string) {
    await this.users.softDelete(userId);
  }

  // ── Восстановление ────────────────────────────────────────────
  async restore(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isDeleted) {
      throw new BadRequestException('No deleted account found with this email');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    await this.users.restore(user.id);
    return this.issueTokens(user.id, user.email);
  }

  // ── Генерация токенов ─────────────────────────────────────────
  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
    });

    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.users.updateRefreshToken(userId, hashed);

    return { accessToken, refreshToken };
  }
}