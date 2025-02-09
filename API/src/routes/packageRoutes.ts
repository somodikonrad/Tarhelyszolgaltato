import express, { Router, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Package } from "../entity/Package";
import { isAdmin } from "../utils/isAdmin";
import jwt from "jsonwebtoken";

const router = Router();

function tokencheck(req: any, res: any, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(400).send('Jelentkezz be!');
  }

  const token = authHeader.split(' ')[1]; // A Bearer token kinyerése
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded); // Dekódolt token kiíratása
    req.user = decoded;  // A dekódolt tokenet hozzárendeled a req.user-hez
    next(); // Ha érvényes a token, megy tovább
  } catch (error) {
    return res.status(400).send('Hibás vagy lejárt token!');
  }
}

// 📌 Tárhelycsomagok listázása (No authentication required here)
router.get('/', async (_req, res) => {
  try {
    const packages = await AppDataSource.getRepository(Package).find({
      select: ["id", "name", "price", "description"]
    });
    res.status(200).send(packages);
  } catch (error) {
    res.status(500).send({ message: "Hiba történt a csomagok lekérésekor.", error });
  }
});

// 📌 Új tárhelycsomag létrehozása (Authentication required)
router.post('/', tokencheck, isAdmin, async (req: any, res: any) => {
  let invalidFields = [];  // A hibás mezők tárolása
  try {
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
      if (!name) invalidFields.push('name');
      if (!price) invalidFields.push('price');
      if (!description) invalidFields.push('description');
      return res.status(400).send({ message: "Hiányzó adatok!", invalid: invalidFields });
    }

    const newPackage = new Package();
    newPackage.name = name;
    newPackage.price = price;
    newPackage.description = description;

    await AppDataSource.getRepository(Package).save(newPackage);

    res.status(201).send({ message: "Tárhelycsomag létrehozva!", package: newPackage });
  } catch (error) {
    res.status(500).send({ message: "Hiba történt a csomag létrehozása során.", error });
  }
});

// 📌 Tárhelycsomag törlése (Authentication and admin check required)
router.delete('/:id', tokencheck, isAdmin, async (req: any, res: any) => {
  let invalidFields = [];  // A hibás mezők tárolása
  try {
    const { id } = req.params;

    if (!id) {
      invalidFields.push('id');
      return res.status(400).send({ message: "Hiányzó csomag ID!", invalid: invalidFields });
    }

    const packageRepo = AppDataSource.getRepository(Package);
    const existingPackage = await packageRepo.findOne({ where: { id: Number(id) } });

    if (!existingPackage) {
      return res.status(404).send({ message: "Csomag nem található!" });
    }

    await packageRepo.remove(existingPackage);

    res.status(200).send({ message: "Csomag törölve!" });
  } catch (error) {
    res.status(500).send({ message: "Hiba a csomag törlése során.", error });
  }
});

// 📌 Tárhelycsomag frissítése (Authentication and admin check required)
router.put('/:id', tokencheck, isAdmin, async (req: any, res: any) => {
  let invalidFields = [];  // A hibás mezők tárolása
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (!id) {
      invalidFields.push('id');
      return res.status(400).send({ message: "Hiányzó csomag ID!", invalid: invalidFields });
    }

    if (!name || !price || !description) {
      if (!name) invalidFields.push('name');
      if (!price) invalidFields.push('price');
      if (!description) invalidFields.push('description');
      return res.status(400).send({ message: "Hiányzó adatok!", invalid: invalidFields });
    }

    const packageRepo = AppDataSource.getRepository(Package);

    // 🔹 Ellenőrizzük, hogy létezik-e a csomag
    const existingPackage = await packageRepo.findOne({ where: { id: Number(id) } });

    if (!existingPackage) {
      return res.status(404).send({ message: "Csomag nem található!" });
    }

    // 🔹 Frissítjük a csomagot
    existingPackage.name = name;
    existingPackage.price = price;
    existingPackage.description = description;

    // 🔹 Mentjük az új adatokat
    await packageRepo.save(existingPackage);

    res.status(200).send({ message: "Csomag frissítve!", package: existingPackage });

  } catch (error) {
    res.status(500).send({ message: "Hiba történt a csomag frissítése során.", error });
  }
});

export default router;
