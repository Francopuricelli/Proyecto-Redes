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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(registerDto, imagenPerfil) {
        const existingEmail = await this.usersService.findByEmail(registerDto.correo);
        if (existingEmail) {
            throw new common_1.ConflictException('El correo electrónico ya está registrado');
        }
        const existingUsername = await this.usersService.findByUsername(registerDto.nombreUsuario);
        if (existingUsername) {
            throw new common_1.ConflictException('El nombre de usuario ya está registrado');
        }
        const birthDate = new Date(registerDto.fechaNacimiento);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 13) {
            throw new common_1.BadRequestException('Debe ser mayor de 13 años para registrarse');
        }
        if (!this.validatePassword(registerDto.contraseña)) {
            throw new common_1.BadRequestException('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
        }
        const userData = {
            ...registerDto,
            imagenPerfil: imagenPerfil || undefined,
        };
        const user = await this.usersService.create(userData);
        const payload = { correo: user.correo, sub: user._id };
        return {
            user,
            access_token: this.jwtService.sign(payload),
        };
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmailOrUsername(loginDto.usuario);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await this.usersService.validatePassword(user, loginDto.contraseña);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = { correo: user.correo, sub: user._id };
        const { contraseña, ...userWithoutPassword } = user.toObject();
        return {
            user: userWithoutPassword,
            access_token: this.jwtService.sign(payload),
        };
    }
    validatePassword(password) {
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasMinLength = password.length >= 8;
        return hasUppercase && hasNumber && hasMinLength;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map