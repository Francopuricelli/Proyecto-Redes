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
exports.PublicacionesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const publicacion_schema_1 = require("./schemas/publicacion.schema");
let PublicacionesService = class PublicacionesService {
    publicacionModel;
    constructor(publicacionModel) {
        this.publicacionModel = publicacionModel;
    }
    async crear(crearPublicacionDto, autorId) {
        const publicacion = new this.publicacionModel({
            ...crearPublicacionDto,
            autor: new mongoose_2.Types.ObjectId(autorId)
        });
        const publicacionGuardada = await publicacion.save();
        await publicacionGuardada.populate('autor', 'nombre apellido email nombreUsuario imagenPerfil');
        const publicacionObj = publicacionGuardada.toJSON();
        publicacionObj.fecha = publicacionObj.fechaCreacion || publicacionObj.createdAt;
        publicacionObj.cantidadLikes = 0;
        if (publicacionObj.autor && publicacionObj.autor._id) {
            publicacionObj.autor.id = publicacionObj.autor._id.toString();
        }
        return publicacionObj;
    }
    async obtenerTodas(ordenarPor = 'fecha', usuarioId, offset = 0, limit = 10) {
        const filtro = { eliminada: false };
        if (usuarioId) {
            filtro.autor = new mongoose_2.Types.ObjectId(usuarioId);
        }
        const ordenamiento = ordenarPor === 'likes'
            ? { 'likes': -1, 'fechaCreacion': -1 }
            : { fechaCreacion: -1 };
        const publicaciones = await this.publicacionModel
            .find(filtro)
            .populate('autor', 'nombre apellido email nombreUsuario imagenPerfil')
            .populate('comentarios.autor', 'nombre apellido nombreUsuario')
            .sort(ordenamiento)
            .skip(offset)
            .limit(limit)
            .exec();
        return publicaciones.map(pub => {
            const publicacionObj = pub.toJSON();
            publicacionObj.cantidadLikes = publicacionObj.likes ? publicacionObj.likes.length : 0;
            publicacionObj.fecha = publicacionObj.fechaCreacion || publicacionObj.createdAt;
            if (publicacionObj.autor && publicacionObj.autor._id) {
                publicacionObj.autor.id = publicacionObj.autor._id.toString();
            }
            if (publicacionObj.comentarios && publicacionObj.comentarios.length > 0) {
                publicacionObj.comentarios = publicacionObj.comentarios.map((comentario) => {
                    if (comentario.autor && comentario.autor._id) {
                        comentario.autor.id = comentario.autor._id.toString();
                    }
                    return comentario;
                });
            }
            return publicacionObj;
        });
    }
    async obtenerPorId(id) {
        const publicacion = await this.publicacionModel
            .findById(id)
            .populate('autor', 'nombre email avatar')
            .populate('comentarios.autor', 'nombre email avatar')
            .exec();
        if (!publicacion || publicacion.eliminada) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        return publicacion;
    }
    async obtenerPorUsuario(usuarioId) {
        return await this.publicacionModel
            .find({ autor: new mongoose_2.Types.ObjectId(usuarioId), eliminada: false })
            .populate('autor', 'nombre email avatar')
            .populate('comentarios.autor', 'nombre email avatar')
            .sort({ fechaCreacion: -1 })
            .exec();
    }
    async actualizar(id, actualizarPublicacionDto, usuarioId) {
        const publicacion = await this.publicacionModel.findById(id);
        if (!publicacion || publicacion.eliminada) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        if (publicacion.autor.toString() !== usuarioId) {
            throw new common_1.ForbiddenException('No tienes permisos para actualizar esta publicación');
        }
        return await this.publicacionModel
            .findByIdAndUpdate(id, actualizarPublicacionDto, { new: true })
            .populate('autor', 'nombre email avatar')
            .populate('comentarios.autor', 'nombre email avatar')
            .exec();
    }
    async eliminar(id, usuarioId) {
        const publicacion = await this.publicacionModel.findById(id);
        if (!publicacion || publicacion.eliminada) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        if (publicacion.autor.toString() !== usuarioId) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar esta publicación');
        }
        await this.publicacionModel.findByIdAndUpdate(id, { eliminada: true });
    }
    async darLike(id, usuarioId) {
        const publicacion = await this.publicacionModel.findById(id);
        if (!publicacion || publicacion.eliminada) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        const yaLeDioLike = publicacion.likes.some(like => like.toString() === usuarioId);
        if (yaLeDioLike) {
            throw new common_1.ForbiddenException('Ya le diste like a esta publicación');
        }
        const publicacionActualizada = await this.publicacionModel
            .findByIdAndUpdate(id, { $addToSet: { likes: new mongoose_2.Types.ObjectId(usuarioId) } }, { new: true })
            .populate('autor', 'nombre apellido email nombreUsuario imagenPerfil')
            .populate('comentarios.autor', 'nombre apellido nombreUsuario')
            .exec();
        const publicacionObj = publicacionActualizada?.toJSON();
        if (publicacionObj && publicacionObj.autor && publicacionObj.autor._id) {
            publicacionObj.autor.id = publicacionObj.autor._id.toString();
        }
        return publicacionObj;
    }
    async quitarLike(id, usuarioId) {
        const publicacion = await this.publicacionModel.findById(id);
        if (!publicacion || publicacion.eliminada) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        const yaLeDioLike = publicacion.likes.some(like => like.toString() === usuarioId);
        if (!yaLeDioLike) {
            throw new common_1.ForbiddenException('No le has dado like a esta publicación');
        }
        const publicacionActualizada = await this.publicacionModel
            .findByIdAndUpdate(id, { $pull: { likes: new mongoose_2.Types.ObjectId(usuarioId) } }, { new: true })
            .populate('autor', 'nombre apellido email nombreUsuario imagenPerfil')
            .populate('comentarios.autor', 'nombre apellido nombreUsuario')
            .exec();
        const publicacionObj = publicacionActualizada?.toJSON();
        if (publicacionObj && publicacionObj.autor && publicacionObj.autor._id) {
            publicacionObj.autor.id = publicacionObj.autor._id.toString();
        }
        return publicacionObj;
    }
    async agregarComentario(id, crearComentarioDto, usuarioId) {
        const publicacion = await this.publicacionModel.findById(id);
        if (!publicacion || publicacion.eliminada) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        publicacion.comentarios.push({
            comentario: crearComentarioDto.comentario,
            autor: usuarioId,
            fecha: new Date()
        });
        await publicacion.save();
        return await this.publicacionModel
            .findById(id)
            .populate('autor', 'nombre email avatar')
            .populate('comentarios.autor', 'nombre email avatar')
            .exec();
    }
};
exports.PublicacionesService = PublicacionesService;
exports.PublicacionesService = PublicacionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(publicacion_schema_1.Publicacion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PublicacionesService);
//# sourceMappingURL=publicaciones.service.js.map