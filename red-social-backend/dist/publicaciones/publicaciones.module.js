"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicacionesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const publicaciones_controller_1 = require("./publicaciones.controller");
const publicaciones_service_1 = require("./publicaciones.service");
const publicacion_schema_1 = require("./schemas/publicacion.schema");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let PublicacionesModule = class PublicacionesModule {
};
exports.PublicacionesModule = PublicacionesModule;
exports.PublicacionesModule = PublicacionesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: publicacion_schema_1.Publicacion.name, schema: publicacion_schema_1.PublicacionSchema }
            ]),
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [publicaciones_controller_1.PublicacionesController],
        providers: [publicaciones_service_1.PublicacionesService],
        exports: [publicaciones_service_1.PublicacionesService]
    })
], PublicacionesModule);
//# sourceMappingURL=publicaciones.module.js.map