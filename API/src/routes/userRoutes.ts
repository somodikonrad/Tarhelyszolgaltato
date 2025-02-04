import express, { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import mysql from "mysql";
import { generatePassword } from "../utils/password";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  multipleStatements: true,
});

const router = Router();


// Felhasználó létrehozása (regisztráció + adatbázis létrehozása)
router.post('/create-user', async (req: any, res: any) => {
    console.log("Request Headers:", req.headers);  // Logolják a kérés fejléceit
  console.log("Request Body:", req.body); 
  const { username, email, domain } = req.body;
  console.log(req.body);

  if (!username || !email || !domain) {
    return res.status(400).json({ message: 'Username, email, and domain are required!' });
  }

  const password = generatePassword();

  // Felhasználó adatainak létrehozása
  const user = new User();
  user.name = username;
  user.email = email;
  user.password = password;
  user.domain = domain;

  try {
    await user.save();  // Save user to database

    // Adatbázis létrehozása
    const createDatabaseSql = `CREATE DATABASE \`${domain}\`;`;
    db.query(createDatabaseSql, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database creation failed', error: err });
      }

      // Felhasználó létrehozása az adatbázishoz
      const createUserSql = `CREATE USER '${domain}'@'localhost' IDENTIFIED BY '${password}';`;
      db.query(createUserSql, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'User creation failed', error: err });
        }

        const grantPrivilegesSql = `GRANT ALL PRIVILEGES ON \`${domain}\`.* TO '${domain}'@'localhost';`;
        db.query(grantPrivilegesSql, (err, results) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to grant privileges', error: err });
          }

          res.status(200).json({
            message: 'User and database created successfully!',
            user: {
              name: user.name,
              email: user.email,
              domain: user.domain,
              role: user.role, // optional, can be added if necessary
            },
            password,
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving user', error: error });
  }
});

// Felhasználók listázása (Adminisztrátor szerep)
router.get('/', async (req, res) => {
  try {
    const users = await AppDataSource.getRepository(User).find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Felhasználó módosítása
router.patch('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    await AppDataSource.getRepository(User).update(userId, req.body);
    const updatedUser = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Felhasználó törlése
router.delete('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    await AppDataSource.getRepository(User).delete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

export default router;
