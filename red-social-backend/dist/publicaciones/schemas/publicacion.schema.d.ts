import { Document, Schema as MongooseSchema } from 'mongoose';
export type PublicacionDocument = Publicacion & Document;
export declare class Publicacion {
    titulo: string;
    contenido: string;
    imagen: string;
    autor: MongooseSchema.Types.ObjectId;
    likes: MongooseSchema.Types.ObjectId[];
    comentarios: {
        comentario: string;
        autor: MongooseSchema.Types.ObjectId;
        fecha: Date;
    }[];
    fechaCreacion: Date;
    eliminada: boolean;
}
export declare const PublicacionSchema: MongooseSchema<Publicacion, import("mongoose").Model<Publicacion, any, any, any, Document<unknown, any, Publicacion, any, {}> & Publicacion & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Publicacion, Document<unknown, {}, import("mongoose").FlatRecord<Publicacion>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Publicacion> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
