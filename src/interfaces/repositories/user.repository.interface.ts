import { User } from '../../domain/entities/user.entity';

export interface UserRepository {
  findUser(userId: number): Promise<User>;
}
