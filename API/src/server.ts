import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import { AppDataSource } from "./data-source";
import { Package } from "./entity/Package";
import packageRoutes from "./routes/packageRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/packages", packageRoutes);


// 🔹 Nem inicializáljuk újra az AppDataSource-t a seedDatabase-ben!
async function seedDatabase() {
  try {
    const packageRepository = AppDataSource.getRepository(Package);

    // Ellenőrizzük, hogy van-e már adat
    const existingPackages = await packageRepository.count();
    if (existingPackages > 0) {
      console.log("⚠️ A `package` tábla már tartalmaz adatokat, seedelés kihagyva.");
      return;
    }

    // Új csomagok beszúrása
    const packages = [
      { name: "Basic", price: 9.99, description: "Alap tárhely csomag 10GB tárhellyel." },
      { name: "Standard", price: 19.99, description: "Közepes tárhely csomag 50GB tárhellyel és adatbázissal." },
      { name: "Premium", price: 29.99, description: "Prémium tárhely csomag korlátlan erőforrásokkal." }
    ];

    await packageRepository.save(packages);
    console.log("✅ `package` tábla sikeresen feltöltve!");
  } catch (error) {
    console.error("❌ Hiba történt a seedelés közben:", error);
  }
}

// 🔹 Az AppDataSource-t itt inicializáljuk, ÉS csak egyszer!
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Adatbázis sikeresen csatlakoztatva!");

    await seedDatabase(); 

    app.listen(3000, () => {
      console.log(`🚀 Server running at http://localhost:3000`);
    });
  })
  .catch((err) => {
    console.error("❌ Hiba történt az adatbázis kapcsolat során:", err);
  });
