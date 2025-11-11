"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(registerDto) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerDto.contraseña, saltRounds);
        const createdUser = new this.userModel({
            ...registerDto,
            contraseña: hashedPassword,
            fechaNacimiento: new Date(registerDto.fechaNacimiento),
        });
        return createdUser.save();
    }
    async findOne(id) {
        return this.userModel.findById(id).select('-contraseña').exec();
    }
    async findById(id) {
        return this.userModel.findById(id).select('-contraseña').exec();
    }
    async findByEmail(correo) {
        return this.userModel.findOne({ correo }).exec();
    }
    async findByUsername(nombreUsuario) {
        return this.userModel.findOne({ nombreUsuario }).exec();
    }
    async findByEmailOrUsername(usuario) {
        return this.userModel.findOne({
            $or: [
                { correo: usuario },
                { nombreUsuario: usuario }
            ]
        }).exec();
    }
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.contraseña);
    }
    async update(id, updateData) {
        return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-contraseña').exec();
    }
    async findAll() {
        return this.userModel.find().select('-contraseña').exec();
    }
    async createUserAsAdmin(userData) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.contraseña, saltRounds);
        const createdUser = new this.userModel({
            ...userData,
            contraseña: hashedPassword,
            fechaNacimiento: new Date(userData.fechaNacimiento),
            perfil: userData.perfil || 'usuario',
            activo: true,
        });
        return createdUser.save();
    }
    async deactivate(id) {
        return this.userModel.findByIdAndUpdate(id, { activo: false }, { new: true }).select('-contraseña').exec();
    }
    async activate(id) {
        return this.userModel.findByIdAndUpdate(id, { activo: true }, { new: true }).select('-contraseña').exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map