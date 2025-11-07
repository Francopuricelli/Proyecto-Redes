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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let AuthController = class AuthController {
    authService;
    cloudinaryService;
    constructor(authService, cloudinaryService) {
        this.authService = authService;
        this.cloudinaryService = cloudinaryService;
    }
    async register(body, file) {
        const passwordKey = Object.keys(body).find(key => key === 'contraseña' || key.includes('contrase'));
        const password = passwordKey ? body[passwordKey] : undefined;
        const registerDto = {
            nombre: body.nombre,
            apellido: body.apellido,
            correo: body.correo,
            nombreUsuario: body.nombreUsuario,
            contraseña: password,
            fechaNacimiento: body.fechaNacimiento,
            descripcionBreve: body.descripcionBreve,
        };
        const dtoInstance = (0, class_transformer_1.plainToInstance)(register_dto_1.RegisterDto, registerDto);
        const errors = await (0, class_validator_1.validate)(dtoInstance);
        if (errors.length > 0) {
            const messages = errors.map(error => Object.values(error.constraints || {})).flat();
            throw new common_1.BadRequestException(messages);
        }
        let imagenPerfil;
        if (file) {
            const result = await this.cloudinaryService.uploadImage(file, 'perfiles');
            imagenPerfil = result.secure_url;
        }
        return this.authService.register(registerDto, imagenPerfil);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('registro'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagenPerfil', {
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Solo se permiten archivos JPG, JPEG y PNG'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        cloudinary_service_1.CloudinaryService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map