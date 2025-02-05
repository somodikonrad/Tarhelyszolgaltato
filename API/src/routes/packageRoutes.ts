import express, { Router } from "express";
import { AppDataSource } from "../data-source";
import { Package } from "../entity/Package";
import { isAdmin } from "../utils/isAdmin";
import { tokencheck } from "../routes/userRoutes";  // Import tokencheck middleware

const router = Router();

// 📌 Tárhelycsomagok listázása (No authentication required here)
router.get('/', async (_req, res) => {
  try {
    const packages = await AppDataSource.getRepository(Package).find({
      select: ["id", "name", "price", "description"]
    });
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: "Hiba történt a csomagok lekérésekor.", error });
  }
});

// 📌 Új tárhelycsomag létrehozása (Authentication required)
router.post('/', tokencheck, isAdmin, async (req: any, res: any) => { 
  try {
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    const newPackage = new Package();
    newPackage.name = name;
    newPackage.price = price;
    newPackage.description = description;

    await AppDataSource.getRepository(Package).save(newPackage);

    res.status(201).json({ message: "Tárhelycsomag létrehozva!", package: newPackage });
  } catch (error) {
    res.status(500).json({ message: "Hiba történt a csomag létrehozása során.", error });
  }
});

// 📌 Tárhelycsomag törlése (Authentication and admin check required)
router.delete('/:id', tokencheck, isAdmin, async (req: any, res: any) => {  
  try {
    const { id } = req.params;
    const packageRepo = AppDataSource.getRepository(Package);

    const existingPackage = await packageRepo.findOne({ where: { id: Number(id) } });

    if (!existingPackage) {
      return res.status(404).json({ message: "Csomag nem található!" });
    }

    await packageRepo.remove(existingPackage);

    res.status(200).json({ message: "Csomag törölve!" });
  } catch (error) {
    res.status(500).json({ message: "Hiba a csomag törlése során.", error });
  }
});

// 📌 Tárhelycsomag frissítése (Authentication and admin check required)
router.put('/:id', tokencheck, isAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    const packageRepo = AppDataSource.getRepository(Package);

    // 🔹 Ellenőrizzük, hogy létezik-e a csomag
    const existingPackage = await packageRepo.findOne({ where: { id: Number(id) } });

    if (!existingPackage) {
      return res.status(404).json({ message: "Csomag nem található!" });
    }

    // 🔹 Frissítjük a csomagot
    existingPackage.name = name;
    existingPackage.price = price;
    existingPackage.description = description;

    // 🔹 Mentjük az új adatokat
    await packageRepo.save(existingPackage);

    res.status(200).json({ message: "Csomag frissítve!", package: existingPackage });

  } catch (error) {
    res.status(500).json({ message: "Hiba történt a csomag frissítése során.", error });
  }
});

export default router;
