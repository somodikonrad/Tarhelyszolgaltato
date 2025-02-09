import express from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

// 📌 Admin jogosultság ellenőrzése
const isAdmin = async (req, res, next) => {
  let invalidFields = [];  // Hibás mezők tárolása
  try {
    const { id } = req.user; // Kinyerjük az id-t a req.user-ből
    if (!id) {
      invalidFields.push('id');
      return res.status(400).json({ message: "Felhasználói azonosító nem található a tokenben!", invalid: invalidFields });
    }

    const user = await AppDataSource.getRepository(User).findOne({ where: { id } });

    if (!user) {
      invalidFields.push('user');
      return res.status(404).json({ message: "Felhasználó nem található!", invalid: invalidFields });
    }

    if (user.role !== UserRole.ADMIN) {
      invalidFields.push('user.role');
      return res.status(403).json({ message: "Hozzáférés megtagadva: csak adminok végezhetik ezt a műveletet!", invalid: invalidFields });
    }

    next(); // Ha minden rendben, mehet tovább a kérelem
  } catch (error) {
    console.error("Hiba a jogosultság ellenőrzése során:", error);
    return res.status(500).json({ message: "Hiba történt a jogosultság ellenőrzése során." });
  }
};

export { isAdmin };
