import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const USER_ROLES = ['admin', 'customer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  /** bcrypt hash; never selected unless asked for explicitly. */
  @Column({ select: false })
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ type: 'varchar', default: 'customer' })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}

/** Public shape of a user: everything except the password hash. */
export type PublicUser = Pick<User, 'id' | 'email' | 'fullName' | 'role'>;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}
