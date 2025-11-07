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
exports.PublicacionSchema = exports.Publicacion = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Publicacion = class Publicacion {
    titulo;
    contenido;
    imagen;
    autor;
    likes;
    comentarios;
    fechaCreacion;
    eliminada;
};
exports.Publicacion = Publicacion;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Publicacion.prototype, "titulo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Publicacion.prototype, "contenido", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Publicacion.prototype, "imagen", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Publicacion.prototype, "autor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], Publicacion.prototype, "likes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                comentario: { type: String, required: true },
                autor: { type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true },
                fecha: { type: Date, default: Date.now },
                modificado: { type: Boolean, default: false }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Publicacion.prototype, "comentarios", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Publicacion.prototype, "fechaCreacion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Publicacion.prototype, "eliminada", void 0);
exports.Publicacion = Publicacion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Publicacion);
exports.PublicacionSchema = mongoose_1.SchemaFactory.createForClass(Publicacion);
exports.PublicacionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});
exports.PublicacionSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});
//# sourceMappingURL=publicacion.schema.js.map