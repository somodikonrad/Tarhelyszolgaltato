import express from "express";
import cors from "cors";
import mysql from "mysql";
import userRoutes from "./routes/userRoutes";
import { AppDataSource } from "./data-source";


const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  multipleStatements: true,
});

app.use(cors());
app.use(express.json());


// Felhasználói route-ok hozzáadása
app.use("/users", userRoutes);

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!#@%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

  AppDataSource.initialize()
.then(()=>{

    app.use(cors());
    app.use(express.json());

    app.use('/users', userRoutes);

    app.listen(3000, ()=>{
        console.log(`Server: http://localhost:3000`);
    });
})
.catch(
    (err)=>{
        console.log(`Hiba történt az adatbázis kapcsolat felépítésekor! (${err})`);
    }
);

