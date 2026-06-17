import {
  Body, Controller, Delete, Get, HttpCode,
  Post, Req, Res, UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RestoreDto } from './dto/restore.dto';
import { AuthGuard } from '@nestjs/passport';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const tokens = await this.auth.register(dto);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTS);
    return res.json({ accessToken: tokens.accessToken });
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const tokens = await this.auth.login(dto);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTS);
    return res.json({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-access'))
  @HttpCode(200)
  async logout(@Req() req: any, @Res() res: Response) {
    const userId = (req.user as any).id;
    await this.auth.logout(userId);
    res.clearCookie('refresh_token');
    return res.json({ message: 'Logged out' });
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: any, @Res() res: Response) {
    const user = req.user as { id: string; email: string; refreshToken: string };
    const tokens = await this.auth.refresh(user.id, user.email, user.refreshToken);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTS);
    return res.json({ accessToken: tokens.accessToken });
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt-access'))
  async profile(@Req() req: any) {
    const userId = (req.user as any).id;
    return this.auth.getProfile(userId);
  }

  @Delete('account')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteAccount(@Req() req: any, @Res() res: Response) {
    const userId = (req.user as any).id;
    await this.auth.deleteAccount(userId);
    res.clearCookie('refresh_token');
    return res.json({ message: 'Account deleted (soft)' });
  }

  @Post('restore')
  async restore(@Body() dto: RestoreDto, @Res() res: Response) {
    const tokens = await this.auth.restore(dto.email, dto.password);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTS);
    return res.json({ accessToken: tokens.accessToken });
  }
}