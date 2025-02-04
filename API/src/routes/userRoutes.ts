import express, { Router } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import { Subscription } from "../entity/Subscription";
import mysql from "mysql2/promise";
import { generatePassword } from "../utils/password";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { isAdmin } from "../utils/isadmin";

dotenv.config();

const router = Router();

// 📌 MySQL kapcsolat
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 📌 SMTP beállítások az e-mail küldéshez
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 📌 Új felhasználó létrehozása
router.post('/create-user', async (req: any, res: any) => {
  try {
    const { username, email, domain, packageId } = req.body;

    if (!username || !email || !domain || !packageId) {
      return res.status(400).json({ message: 'Hiányzó adatok! (username, email, domain, packageId szükséges)' });
    }

    const existingUser = await AppDataSource.getRepository(User).findOne({
      where: [{ email }, { domain }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Ez az e-mail vagy domain már létezik!' });
    }

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const databaseName = `13a_${domain.replace(/\W/g, '')}`;
    const mysqlUser = `13a_${domain.replace(/\W/g, '')}`;
    const mysqlHost = 'localhost';

    // 📌 Felhasználó létrehozása
    const user = new User();
    user.name = username;
    user.email = email;
    user.password = hashedPassword;
    user.domain = domain;

    await AppDataSource.getRepository(User).save(user);

    // 📌 Előfizetés mentése
    const subscription = new Subscription();
    subscription.user = user;
    subscription.date = new Date();

    await AppDataSource.getRepository(Subscription).save(subscription);

    // 📌 Adatbázis és MySQL felhasználó létrehozása
    const connection = await db.getConnection();
    try {
      await connection.query(`CREATE DATABASE \`${databaseName}\`;`);
      await connection.query(`CREATE USER '${mysqlUser}'@'${mysqlHost}' IDENTIFIED BY '${rawPassword}';`);
      await connection.query(`GRANT ALL PRIVILEGES ON \`${databaseName}\`.* TO '${mysqlUser}'@'${mysqlHost}';`);
      await connection.query(`FLUSH PRIVILEGES;`);
    } finally {
      connection.release();
    }

    // 📌 E-mail küldése
    const mailOptions = {
      from: `"Tárhelyszolgáltató" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Előfizetés visszaigazolása",
      html: `
        <h2>Kedves ${username}!</h2>
        <p>Sikeresen előfizettél a szolgáltatásra.</p>
        <h3>Belépési adatok:</h3>
        <ul>
          <li><strong>Felhasználónév:</strong> ${mysqlUser}</li>
          <li><strong>Jelszó:</strong> ${rawPassword} (Kérlek, változtasd meg!)</li>
          <li><strong>Adatbázis:</strong> ${databaseName}</li>
          <li><strong>Host:</strong> ${mysqlHost}</li>
        </ul>
        <p>Üdvözlettel,<br>Tárhelyszolgáltató csapat</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Felhasználó és előfizetés létrehozva! E-mail elküldve.',
      user: { name: user.name, email: user.email, domain: user.domain },
      subscription: { date: subscription.date },
      database: databaseName,
      mysqlUser,
      password: "A jelszót az e-mail tartalmazza.",
    });

  } catch (error) {
    console.error("Hiba a felhasználó létrehozásakor:", error);
    res.status(500).json({ message: 'Hiba történt a regisztráció során', error });
  }
});

// 📌 Felhasználók kilistázása (csak adminoknak)
router.get('/', isAdmin, async (_req: any, res: any) => {
  try {
    const users = await AppDataSource.getRepository(User).find({
      select: ["id", "name", "email", "domain", "role"], // Válaszd ki, mely mezőket szeretnél visszakapni
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Hiba a felhasználók kilistázása során:", error);
    res.status(500).json({ message: "Hiba történt a felhasználók lekérésekor.", error });
  }
});

export default router;
