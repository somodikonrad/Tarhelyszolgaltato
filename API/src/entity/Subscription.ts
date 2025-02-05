import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from "typeorm";
import { User } from "./User";
import { Package } from "./Package";

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") // UUID alapú azonosító
  id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE" }) 
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Package, packageData => packageData.id, { onDelete: "CASCADE" }) 
  @JoinColumn({ name: "package_id" })
  package: Package;

  @Column()
  date: Date;

  @Column({ unique: true }) // Domain is egyedi kell legyen
  domain: string;
}
