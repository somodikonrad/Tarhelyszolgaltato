import express, { Request, Response, NextFunction, Router } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import { Subscription } from "../entity/Subscription";
import { Package } from "../entity/Package";
import mysql from "mysql2/promise";
import { generatePassword } from "../utils/password";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";  // bcrypt importálása
import { isAdmin } from "../utils/isAdmin";
const jwt = require('jsonwebtoken');
dotenv.config();
import ejs from "ejs";
import { invalid } from "joi";

const router = Router();
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// SMTP beállítások
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

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

// 📌 Jelszó érvényesítési szabályok
function validatePassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

router.post("/register", async (req: any, res: any) => {
  let invalidFields = [];
  try {
    console.log('Regisztrációs kérés érkezett:', req.body);  // Mi érkezik a frontend-ről?

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      if (!username) invalidFields.push('username');
      if (!email) invalidFields.push('email');
      if (!password) invalidFields.push('password');
      
      return res.status(400).json({ 
        message: "Hiányzó adatok! (username, email, password szükséges)", 
        invalid: invalidFields 
      });
    }

    if (!validatePassword(password)) {
      invalidFields.push('password');
      return res.status(400).json({ 
        message: "A jelszó nem felel meg az erősségi követelményeknek!", 
        invalid: invalidFields 
      });
    }

    const existingUser = await AppDataSource.getRepository(User).findOne({ where: { email } });
    if (existingUser) {
      invalidFields.push('email');
      return res.status(400).json({ 
        message: "Ez az e-mail már létezik!", 
        invalid: invalidFields 
      });
    }

    // Jelszó hash-elése bcrypt-tel
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.name = username;
    user.email = email;
    user.password = hashedPassword;

    await AppDataSource.getRepository(User).save(user);

    // Naplózzuk, hogy mi történik, amikor sikeres a regisztráció
    console.log("Sikeres regisztráció:", user);
    
    res.status(201).json({
      user: { name: user.name, email: user.email },
      invalid: [] , // Ha nincs hiba, akkor üres tömböt adunk vissza
      token: generateToken(user)
    });

  } catch (error) {
    console.error("Hiba a regisztráció során:", error);
    res.status(500).json({ 
      message: "Hiba történt a regisztráció során", 
      invalid: []  // Az esetleges hiba esetén is üres tömböt küldünk
    });
  }
});


// 📌 Bejelentkezés
router.post("/login", async (req: any, res: any) => {
  let invalidFields = [];  // A hibás mezők tárolása
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      if (!email) invalidFields.push('email');
      if (!password) invalidFields.push('password');
      
      return res.status(400).send({ message: "Hiányzó adatok! (email, password szükséges)", invalid: invalidFields });
    }

    const user = await AppDataSource.getRepository(User).findOne({ where: { email } });
    if (!user) {
      invalidFields.push('user');
      return res.status(400).send({ message: "Felhasználó nem található!", invalid: invalidFields });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({ message: "Hibás jelszó!" });
    }

    res.status(200).send({
      message: "Sikeres bejelentkezés!",
      token: generateToken(user)
    });

  } catch (error) {
    console.error("Hiba a bejelentkezés során:", error);
    res.status(500).send({ message: "Hiba történt a bejelentkezés során" + error });
  }
});

// 📌 Felhasználók kilistázása (csak adminoknak)
router.get('/', tokencheck, isAdmin, async (_req: any, res: any) => {
  try {
    const users = await AppDataSource.getRepository(User).find({
      select: ["id", "name", "email", "role"], // Válaszd ki, mely mezőket szeretnél visszakapni
    });
 
    res.status(200).send({ users });
  } catch (error) {
    console.error("Hiba a felhasználók kilistázása során:", error);
    res.status(500).send({ message: "Hiba történt a felhasználók lekérésekor." + error });
  }
});

// 📌 Felhasználói előfizetés (egy domain per user, csak bejelentkezett felhasználóknak)
router.post("/subscribe", tokencheck, async (req: any, res: any) => {
  let invalidFields = [];  // A hibás mezők tárolása
  try {
    const { packageId } = req.body;

    if (!packageId) {
      invalidFields.push('packageId');
      return res.status(400).send({ message: "Hiányzó adat! (packageId szükséges)", invalid: invalidFields });
    }

    const user = await AppDataSource.getRepository(User).findOne({ where: { id: req.user?.userId } });
    if (!user) {
      invalidFields.push('user');
      return res.status(404).send({ message: "Felhasználó nem található!", invalid: invalidFields });
    }

    const existingSubscription = await AppDataSource.getRepository(Subscription).findOne({ where: { user: user } });
    if (existingSubscription) {
      return res.status(400).send({ message: "Már van előfizetésed!" });
    }

    const domain = user.name.trim().toLowerCase().replace(/\s+/g, '').replace(/\W/g, '');

    const packageData = await AppDataSource.getRepository(Package).findOne({ where: { id: packageId } });
    if (!packageData) {
      invalidFields.push('packageData');
      return res.status(404).send({ message: "Tárhelycsomag nem található!", invalid: invalidFields });
    }

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const databaseName = `13a_${domain}`;
    const mysqlUser = `13a_${domain}`;
    const mysqlHost = "localhost";

    const subscription = new Subscription();
    subscription.user = user;
    subscription.package = packageData;
    subscription.date = new Date();
    subscription.domain = domain;

    await AppDataSource.getRepository(Subscription).save(subscription);

    const connection = await db.getConnection();
    try {
      await connection.query("CREATE DATABASE ??;", [databaseName]);
      await connection.query("CREATE USER ??@?? IDENTIFIED BY ?;", [mysqlUser, mysqlHost, rawPassword]);
      await connection.query("GRANT ALL PRIVILEGES ON ??.* TO ??@??;", [databaseName, mysqlUser, mysqlHost]);
      await connection.query(`FLUSH PRIVILEGES;`);
    } finally {
      connection.release();
    }

    ejs.renderFile("views/subscription-email.ejs", { user, mysqlUser, rawPassword, databaseName, domain, mysqlHost }, async (err, html) => {
      if (err) {
        console.error("E-mail sablon renderelési hiba:", err);
        return res.status(500).send({ message: "Hiba történt az e-mail sablon renderelésekor", error: err });
      }

      const mailOptions = {
        from: `"Tárhelyszolgáltató" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Előfizetés visszaigazolása",
        html: html,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("E-mail sikeresen elküldve");
        res.status(201).send({ message: "Előfizetés sikeres!", domain });
      } catch (error) {
        console.error("E-mail küldési hiba:", error);
        res.status(500).send({ message: "Hiba történt az e-mail küldésekor", error });
      }
    });

  } catch (error) {
    console.error("Hiba az előfizetés során:", error);
    res.status(500).send({ message: "Hiba történt az előfizetés során", error });
  }
});

export default router;
