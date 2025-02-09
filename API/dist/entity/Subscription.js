"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Package_1 = require("./Package");
let Subscription = class Subscription extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid") // UUID alapú azonosító
    ,
    __metadata("design:type", String)
], Subscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", User_1.User)
], Subscription.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Package_1.Package, packageData => packageData.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "package_id" }),
    __metadata("design:type", Package_1.Package)
], Subscription.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Subscription.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }) // Domain is egyedi kell legyen
    ,
    __metadata("design:type", String)
], Subscription.prototype, "domain", void 0);
Subscription = __decorate([
    (0, typeorm_1.Entity)()
], Subscription);
exports.Subscription = Subscription;
