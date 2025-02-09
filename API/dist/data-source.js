"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User"); // Az adatbázis entity-k importálása
const Subscription_1 = require("./entity/Subscription");
const Package_1 = require("./entity/Package");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "13a_tarhelyszolgaltato",
    synchronize: true,
    logging: false,
    entities: [User_1.User, Subscription_1.Subscription, Package_1.Package],
    migrations: [],
    subscribers: [],
});
