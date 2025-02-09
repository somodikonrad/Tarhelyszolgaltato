"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure you set this in your .env
// Function to generate JWT
const generateToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, JWT_SECRET, { expiresIn: "1h" }); // Token expires in 1 hour
};
exports.generateToken = generateToken;
// Function to verify JWT
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
