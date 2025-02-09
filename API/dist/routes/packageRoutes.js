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
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Package_1 = require("../entity/Package");
const isAdmin_1 = require("../utils/isAdmin");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
function tokencheck(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(400).send('Jelentkezz be!');
    }
    const token = authHeader.split(' ')[1]; // A Bearer token kinyerése
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log(decoded); // Dekódolt token kiíratása
        req.user = decoded; // A dekódolt tokenet hozzárendeled a req.user-hez
        next(); // Ha érvényes a token, megy tovább
    }
    catch (error) {
        return res.status(400).send('Hibás vagy lejárt token!');
    }
}
// 📌 Tárhelycsomagok listázása (No authentication required here)
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const packages = yield data_source_1.AppDataSource.getRepository(Package_1.Package).find({
            select: ["id", "name", "price", "description"]
        });
        res.status(200).send(packages);
    }
    catch (error) {
        res.status(500).send({ message: "Hiba történt a csomagok lekérésekor.", error });
    }
}));
// 📌 Új tárhelycsomag létrehozása (Authentication required)
router.post('/', tokencheck, isAdmin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let invalidFields = []; // A hibás mezők tárolása
    try {
        const { name, price, description } = req.body;
        if (!name || !price || !description) {
            if (!name)
                invalidFields.push('name');
            if (!price)
                invalidFields.push('price');
            if (!description)
                invalidFields.push('description');
            return res.status(400).send({ message: "Hiányzó adatok!", invalid: invalidFields });
        }
        const newPackage = new Package_1.Package();
        newPackage.name = name;
        newPackage.price = price;
        newPackage.description = description;
        yield data_source_1.AppDataSource.getRepository(Package_1.Package).save(newPackage);
        res.status(201).send({ message: "Tárhelycsomag létrehozva!", package: newPackage });
    }
    catch (error) {
        res.status(500).send({ message: "Hiba történt a csomag létrehozása során.", error });
    }
}));
// 📌 Tárhelycsomag törlése (Authentication and admin check required)
router.delete('/:id', tokencheck, isAdmin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let invalidFields = []; // A hibás mezők tárolása
    try {
        const { id } = req.params;
        if (!id) {
            invalidFields.push('id');
            return res.status(400).send({ message: "Hiányzó csomag ID!", invalid: invalidFields });
        }
        const packageRepo = data_source_1.AppDataSource.getRepository(Package_1.Package);
        const existingPackage = yield packageRepo.findOne({ where: { id: Number(id) } });
        if (!existingPackage) {
            return res.status(404).send({ message: "Csomag nem található!" });
        }
        yield packageRepo.remove(existingPackage);
        res.status(200).send({ message: "Csomag törölve!" });
    }
    catch (error) {
        res.status(500).send({ message: "Hiba a csomag törlése során.", error });
    }
}));
// 📌 Tárhelycsomag frissítése (Authentication and admin check required)
router.put('/:id', tokencheck, isAdmin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let invalidFields = []; // A hibás mezők tárolása
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;
        if (!id) {
            invalidFields.push('id');
            return res.status(400).send({ message: "Hiányzó csomag ID!", invalid: invalidFields });
        }
        if (!name || !price || !description) {
            if (!name)
                invalidFields.push('name');
            if (!price)
                invalidFields.push('price');
            if (!description)
                invalidFields.push('description');
            return res.status(400).send({ message: "Hiányzó adatok!", invalid: invalidFields });
        }
        const packageRepo = data_source_1.AppDataSource.getRepository(Package_1.Package);
        // 🔹 Ellenőrizzük, hogy létezik-e a csomag
        const existingPackage = yield packageRepo.findOne({ where: { id: Number(id) } });
        if (!existingPackage) {
            return res.status(404).send({ message: "Csomag nem található!" });
        }
        // 🔹 Frissítjük a csomagot
        existingPackage.name = name;
        existingPackage.price = price;
        existingPackage.description = description;
        // 🔹 Mentjük az új adatokat
        yield packageRepo.save(existingPackage);
        res.status(200).send({ message: "Csomag frissítve!", package: existingPackage });
    }
    catch (error) {
        res.status(500).send({ message: "Hiba történt a csomag frissítése során.", error });
    }
}));
exports.default = router;
