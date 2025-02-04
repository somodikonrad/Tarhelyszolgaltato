import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum UserRole {
    ADMIN = "admin",
    USER = "user"
  }

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER, 
  })
  role: UserRole;

  @Column()
  domain: string;
}
