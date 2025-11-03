"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarPublicacionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const crear_publicacion_dto_1 = require("./crear-publicacion.dto");
class ActualizarPublicacionDto extends (0, mapped_types_1.PartialType)(crear_publicacion_dto_1.CrearPublicacionDto) {
}
exports.ActualizarPublicacionDto = ActualizarPublicacionDto;
//# sourceMappingURL=actualizar-publicacion.dto.js.map