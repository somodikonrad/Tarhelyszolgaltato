import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";

// 📌 Admin jogosultság ellenőrzése
const isAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Felhasználói azonosító (userId) szükséges!" });
    }

    const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található!" });
    }

    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Hozzáférés megtagadva: csak adminok végezhetik ezt a műveletet!" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Hiba történt a jogosultság ellenőrzése során." });
  }
};

export { isAdmin }; 
