import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import * as bcrypt from "bcrypt";

export enum UserRole {
    ADMIN = "admin",
    USER = "user"
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") // UUID alapú azonosító
  id: string;

  @Column()
  name: string;

  @Column({ unique: true }) // E-mail egyedi kell legyen
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER, 
  })
  role: UserRole;

  
}
