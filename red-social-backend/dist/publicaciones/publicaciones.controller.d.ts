import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from './dto/actualizar-publicacion.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
export declare class PublicacionesController {
    private readonly publicacionesService;
    constructor(publicacionesService: PublicacionesService);
    crear(crearPublicacionDto: CrearPublicacionDto, req: any, file?: Express.Multer.File): Promise<import("./schemas/publicacion.schema").Publicacion>;
    obtenerTodas(ordenarPor?: 'fecha' | 'likes', usuarioId?: string, offset?: string, limit?: string): Promise<import("./schemas/publicacion.schema").Publicacion[]>;
    obtenerPorId(id: string): Promise<any>;
    obtenerPorUsuario(usuarioId: string): Promise<import("./schemas/publicacion.schema").Publicacion[]>;
    actualizar(id: string, actualizarPublicacionDto: ActualizarPublicacionDto, req: any): Promise<import("./schemas/publicacion.schema").PublicacionDocument | null>;
    eliminar(id: string, req: any): Promise<{
        mensaje: string;
    }>;
    darLike(id: string, req: any): Promise<import("./schemas/publicacion.schema").PublicacionDocument | null>;
    quitarLike(id: string, req: any): Promise<import("./schemas/publicacion.schema").PublicacionDocument | null>;
    agregarComentario(id: string, crearComentarioDto: CrearComentarioDto, req: any): Promise<import("./schemas/publicacion.schema").PublicacionDocument | null>;
    obtenerComentarios(id: string, offset?: string, limit?: string): Promise<any>;
    editarComentario(publicacionId: string, comentarioId: string, editarComentarioDto: {
        texto: string;
    }, req: any): Promise<any>;
}
