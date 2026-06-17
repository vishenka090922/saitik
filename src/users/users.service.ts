import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(email: string, hashedPassword: string): Promise<User> {
    const user = this.repo.create({ email, password: hashedPassword });
    return this.repo.save(user);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.repo.update(id, { refreshToken: token } as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      refreshToken: null,
    } as any);
  }

  async restore(id: string): Promise<void> {
    await this.repo.update(id, {
      isDeleted: false,
      deletedAt: null,
    } as any);
  }
}