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
exports.isAdmin = void 0;
const express_1 = __importDefault(require("express"));
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// 📌 Admin jogosultság ellenőrzése
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let invalidFields = []; // Hibás mezők tárolása
    try {
        const { id } = req.user; // Kinyerjük az id-t a req.user-ből
        if (!id) {
            invalidFields.push('id');
            return res.status(400).json({ message: "Felhasználói azonosító nem található a tokenben!", invalid: invalidFields });
        }
        const user = yield data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id } });
        if (!user) {
            invalidFields.push('user');
            return res.status(404).json({ message: "Felhasználó nem található!", invalid: invalidFields });
        }
        if (user.role !== User_1.UserRole.ADMIN) {
            invalidFields.push('user.role');
            return res.status(403).json({ message: "Hozzáférés megtagadva: csak adminok végezhetik ezt a műveletet!", invalid: invalidFields });
        }
        next(); // Ha minden rendben, mehet tovább a kérelem
    }
    catch (error) {
        console.error("Hiba a jogosultság ellenőrzése során:", error);
        return res.status(500).json({ message: "Hiba történt a jogosultság ellenőrzése során." });
    }
});
exports.isAdmin = isAdmin;
