import { DataSource } from "typeorm";
import { User } from "./entity/User"; // Az adatbázis entity-k importálása
import { Subscription } from "./entity/Subscription";
import { Package } from "./entity/Package";

export const AppDataSource = new DataSource({
  type: "mysql", // MySQL adatbázis típusa
  host: "localhost", // Az adatbázis hostja
  port: 3306, // Az adatbázis portja (default 3306 MySQL esetén)
  username: "root", // Adatbázis felhasználónév
  password: "", // Adatbázis jelszó
  database: "13a_tarhelyszolgaltato", // Az adatbázis neve, amit használsz
  synchronize: true, // Az entitások automatikus szinkronizálása (development módban jó)
  logging: false, // Hibaüzenetek logolása
  entities: [User, Subscription,Package], // Az entity-k listája, pl. User
  migrations: [],
  subscribers: [],
});
