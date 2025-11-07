import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from './dto/actualizar-publicacion.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
export declare class PublicacionesService {
    private publicacionModel;
    constructor(publicacionModel: Model<PublicacionDocument>);
    crear(crearPublicacionDto: CrearPublicacionDto, autorId: string, file?: Express.Multer.File): Promise<Publicacion>;
    obtenerTodas(ordenarPor?: 'fecha' | 'likes', usuarioId?: string, offset?: string, limit?: string): Promise<Publicacion[]>;
    obtenerPorId(id: string): Promise<PublicacionDocument>;
    obtenerPorUsuario(usuarioId: string): Promise<Publicacion[]>;
    actualizar(id: string, actualizarPublicacionDto: ActualizarPublicacionDto, usuarioId: string): Promise<PublicacionDocument | null>;
    eliminar(id: string, usuarioId: string): Promise<{
        mensaje: string;
    }>;
    darLike(id: string, usuarioId: string): Promise<PublicacionDocument | null>;
    quitarLike(id: string, usuarioId: string): Promise<PublicacionDocument | null>;
    agregarComentario(id: string, crearComentarioDto: CrearComentarioDto, usuarioId: string): Promise<PublicacionDocument | null>;
}
