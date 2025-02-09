"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const data_source_1 = require("./data-source");
const Package_1 = require("./entity/Package");
const packageRoutes_1 = __importDefault(require("./routes/packageRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/users", userRoutes_1.default);
app.use("/packages", packageRoutes_1.default);
// 🔹 Nem inicializáljuk újra az AppDataSource-t a seedDatabase-ben!
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const packageRepository = data_source_1.AppDataSource.getRepository(Package_1.Package);
            // Ellenőrizzük, hogy van-e már adat
            const existingPackages = yield packageRepository.count();
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
            yield packageRepository.save(packages);
            console.log("✅ `package` tábla sikeresen feltöltve!");
        }
        catch (error) {
            console.error("❌ Hiba történt a seedelés közben:", error);
        }
    });
}
// 🔹 Az AppDataSource-t itt inicializáljuk, ÉS csak egyszer!
data_source_1.AppDataSource.initialize()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("✅ Adatbázis sikeresen csatlakoztatva!");
    yield seedDatabase();
    app.listen(3000, () => {
        console.log(`🚀 Server running at http://localhost:3000`);
    });
}))
    .catch((err) => {
    console.error("❌ Hiba történt az adatbázis kapcsolat során:", err);
});
