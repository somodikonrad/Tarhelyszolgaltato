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
const User_1 = require("../entity/User");
const Subscription_1 = require("../entity/Subscription");
const Package_1 = require("../entity/Package");
const promise_1 = __importDefault(require("mysql2/promise"));
const password_1 = require("../utils/password");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt")); // bcrypt importálása
const isAdmin_1 = require("../utils/isAdmin");
const jwt = require('jsonwebtoken');
dotenv_1.default.config();
const ejs_1 = __importDefault(require("ejs"));
const router = (0, express_1.Router)();
const db = promise_1.default.createPool({
    host: "localhost",
    user: "root",
    password: "",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// SMTP beállítások
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
}
function tokencheck(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(400).send('Jelentkezz be!');
    }
    const token = authHeader.split(' ')[1]; // A Bearer token kinyerése
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded); // Dekódolt token kiíratása
        req.user = decoded; // A dekódolt tokenet hozzárendeled a req.user-hez
        next(); // Ha érvényes a token, megy tovább
    }
    catch (error) {
        return res.status(400).send('Hibás vagy lejárt token!');
    }
}
// 📌 Jelszó érvényesítési szabályok
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let invalidFields = [];
    try {
        console.log('Regisztrációs kérés érkezett:', req.body); // Mi érkezik a frontend-ről?
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            if (!username)
                invalidFields.push('username');
            if (!email)
                invalidFields.push('email');
            if (!password)
                invalidFields.push('password');
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
        const existingUser = yield data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { email } });
        if (existingUser) {
            invalidFields.push('email');
            return res.status(400).json({
                message: "Ez az e-mail már létezik!",
                invalid: invalidFields
            });
        }
        // Jelszó hash-elése bcrypt-tel
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new User_1.User();
        user.name = username;
        user.email = email;
        user.password = hashedPassword;
        yield data_source_1.AppDataSource.getRepository(User_1.User).save(user);
        // Naplózzuk, hogy mi történik, amikor sikeres a regisztráció
        console.log("Sikeres regisztráció:", user);
        res.status(201).json({
            user: { name: user.name, email: user.email },
            invalid: [],
            token: generateToken(user)
        });
    }
    catch (error) {
        console.error("Hiba a regisztráció során:", error);
        res.status(500).json({
            message: "Hiba történt a regisztráció során",
            invalid: [] // Az esetleges hiba esetén is üres tömböt küldünk
        });
    }
}));
// 📌 Bejelentkezés
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let invalidFields = []; // A hibás mezők tárolása
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            if (!email)
                invalidFields.push('email');
            if (!password)
                invalidFields.push('password');
            return res.status(400).send({ message: "Hiányzó adatok! (email, password szükséges)", invalid: invalidFields });
        }
        const user = yield data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { email } });
        if (!user) {
            invalidFields.push('user');
            return res.status(400).send({ message: "Felhasználó nem található!", invalid: invalidFields });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send({ message: "Hibás jelszó!" });
        }
        res.status(200).send({
            message: "Sikeres bejelentkezés!",
            token: generateToken(user)
        });
    }
    catch (error) {
        console.error("Hiba a bejelentkezés során:", error);
        res.status(500).send({ message: "Hiba történt a bejelentkezés során" + error });
    }
}));
// 📌 Felhasználók kilistázása (csak adminoknak)
router.get('/', tokencheck, isAdmin_1.isAdmin, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield data_source_1.AppDataSource.getRepository(User_1.User).find({
            select: ["id", "name", "email", "role"], // Válaszd ki, mely mezőket szeretnél visszakapni
        });
        res.status(200).send({ users });
    }
    catch (error) {
        console.error("Hiba a felhasználók kilistázása során:", error);
        res.status(500).send({ message: "Hiba történt a felhasználók lekérésekor." + error });
    }
}));
// 📌 Felhasználói előfizetés (egy domain per user, csak bejelentkezett felhasználóknak)
router.post("/subscribe", tokencheck, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let invalidFields = []; // A hibás mezők tárolása
    try {
        const { packageId } = req.body;
        if (!packageId) {
            invalidFields.push('packageId');
            return res.status(400).send({ message: "Hiányzó adat! (packageId szükséges)", invalid: invalidFields });
        }
        const user = yield data_source_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId } });
        if (!user) {
            invalidFields.push('user');
            return res.status(404).send({ message: "Felhasználó nem található!", invalid: invalidFields });
        }
        const existingSubscription = yield data_source_1.AppDataSource.getRepository(Subscription_1.Subscription).findOne({ where: { user: user } });
        if (existingSubscription) {
            return res.status(400).send({ message: "Már van előfizetésed!" });
        }
        const domain = user.name.trim().toLowerCase().replace(/\s+/g, '').replace(/\W/g, '');
        const packageData = yield data_source_1.AppDataSource.getRepository(Package_1.Package).findOne({ where: { id: packageId } });
        if (!packageData) {
            invalidFields.push('packageData');
            return res.status(404).send({ message: "Tárhelycsomag nem található!", invalid: invalidFields });
        }
        const rawPassword = (0, password_1.generatePassword)();
        const hashedPassword = yield bcrypt_1.default.hash(rawPassword, 10);
        const databaseName = `13a_${domain}`;
        const mysqlUser = `13a_${domain}`;
        const mysqlHost = "localhost";
        const subscription = new Subscription_1.Subscription();
        subscription.user = user;
        subscription.package = packageData;
        subscription.date = new Date();
        subscription.domain = domain;
        yield data_source_1.AppDataSource.getRepository(Subscription_1.Subscription).save(subscription);
        const connection = yield db.getConnection();
        try {
            yield connection.query("CREATE DATABASE ??;", [databaseName]);
            yield connection.query("CREATE USER ??@?? IDENTIFIED BY ?;", [mysqlUser, mysqlHost, rawPassword]);
            yield connection.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX, REFERENCES,
              CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, SHOW VIEW, CREATE ROUTINE,
              ALTER ROUTINE, EVENT, TRIGGER, 
              CREATE USER, CREATE TABLESPACE, CREATE VIEW, RELOAD, SHUTDOWN,
              PROCESS, FILE, SUPER, CREATE TEMPORARY TABLES, CREATE DATABASE, 
              GRANT OPTION
        ON ??.* TO ??@??;
      `, [databaseName, mysqlUser, mysqlHost]);
            yield connection.query(`FLUSH PRIVILEGES;`);
        }
        finally {
            connection.release();
        }
        ejs_1.default.renderFile("views/subscription-email.ejs", { user, mysqlUser, rawPassword, databaseName, domain, mysqlHost }, (err, html) => __awaiter(void 0, void 0, void 0, function* () {
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
                yield transporter.sendMail(mailOptions);
                console.log("E-mail sikeresen elküldve");
                res.status(201).send({ message: "Előfizetés sikeres!", domain });
            }
            catch (error) {
                console.error("E-mail küldési hiba:", error);
                res.status(500).send({ message: "Hiba történt az e-mail küldésekor", error });
            }
        }));
    }
    catch (error) {
        console.error("Hiba az előfizetés során:", error);
        res.status(500).send({ message: "Hiba történt az előfizetés során", error });
    }
}));
exports.default = router;
