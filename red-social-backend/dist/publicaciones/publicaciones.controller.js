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
exports.PublicacionesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const publicaciones_service_1 = require("./publicaciones.service");
const crear_publicacion_dto_1 = require("./dto/crear-publicacion.dto");
const actualizar_publicacion_dto_1 = require("./dto/actualizar-publicacion.dto");
const crear_comentario_dto_1 = require("./dto/crear-comentario.dto");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let PublicacionesController = class PublicacionesController {
    publicacionesService;
    cloudinaryService;
    constructor(publicacionesService, cloudinaryService) {
        this.publicacionesService = publicacionesService;
        this.cloudinaryService = cloudinaryService;
    }
    async crear(crearPublicacionDto, req, file) {
        if (file) {
            const result = await this.cloudinaryService.uploadImage(file, 'publicaciones');
            crearPublicacionDto.imagen = result.secure_url;
        }
        return await this.publicacionesService.crear(crearPublicacionDto, req.user.id);
    }
    async obtenerTodas(ordenarPor, usuarioId, offset, limit) {
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return await this.publicacionesService.obtenerTodas(ordenarPor || 'fecha', usuarioId, offsetNum, limitNum);
    }
    async obtenerPorId(id) {
        return await this.publicacionesService.obtenerPorId(id);
    }
    async obtenerPorUsuario(usuarioId) {
        return await this.publicacionesService.obtenerPorUsuario(usuarioId);
    }
    async actualizar(id, actualizarPublicacionDto, req) {
        return await this.publicacionesService.actualizar(id, actualizarPublicacionDto, req.user.id);
    }
    async eliminar(id, req) {
        await this.publicacionesService.eliminar(id, req.user.id);
        return { mensaje: 'Publicación eliminada correctamente' };
    }
    async darLike(id, req) {
        return await this.publicacionesService.darLike(id, req.user.id);
    }
    async quitarLike(id, req) {
        return await this.publicacionesService.quitarLike(id, req.user.id);
    }
    async agregarComentario(id, crearComentarioDto, req) {
        return await this.publicacionesService.agregarComentario(id, crearComentarioDto, req.user.id);
    }
};
exports.PublicacionesController = PublicacionesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', {
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Solo se permiten archivos de imagen'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        }
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_publicacion_dto_1.CrearPublicacionDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('ordenarPor')),
    __param(1, (0, common_1.Query)('usuarioId')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerTodas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerPorId", null);
__decorate([
    (0, common_1.Get)('usuario/:usuarioId'),
    __param(0, (0, common_1.Param)('usuarioId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerPorUsuario", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, actualizar_publicacion_dto_1.ActualizarPublicacionDto, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/like'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "darLike", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id/like'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "quitarLike", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/comentarios'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crear_comentario_dto_1.CrearComentarioDto, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "agregarComentario", null);
exports.PublicacionesController = PublicacionesController = __decorate([
    (0, common_1.Controller)('publicaciones'),
    __metadata("design:paramtypes", [publicaciones_service_1.PublicacionesService,
        cloudinary_service_1.CloudinaryService])
], PublicacionesController);
//# sourceMappingURL=publicaciones.controller.js.map