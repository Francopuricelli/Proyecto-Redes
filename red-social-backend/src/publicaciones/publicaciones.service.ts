import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from './dto/actualizar-publicacion.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>
  ) {}

  async crear(crearPublicacionDto: CrearPublicacionDto, autorId: string): Promise<Publicacion> {
    const publicacion = new this.publicacionModel({
      ...crearPublicacionDto,
      autor: new Types.ObjectId(autorId)
    });
    return await publicacion.save();
  }

  async obtenerTodas(): Promise<Publicacion[]> {
    return await this.publicacionModel
      .find({ eliminada: false })
      .populate('autor', 'nombre email avatar')
      .populate('comentarios.autor', 'nombre email avatar')
      .sort({ fechaCreacion: -1 })
      .exec();
  }

  async obtenerPorId(id: string): Promise<PublicacionDocument> {
    const publicacion = await this.publicacionModel
      .findById(id)
      .populate('autor', 'nombre email avatar')
      .populate('comentarios.autor', 'nombre email avatar')
      .exec();
    
    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('Publicación no encontrada');
    }
    
    return publicacion;
  }

  async obtenerPorUsuario(usuarioId: string): Promise<Publicacion[]> {
    return await this.publicacionModel
      .find({ autor: new Types.ObjectId(usuarioId), eliminada: false })
      .populate('autor', 'nombre email avatar')
      .populate('comentarios.autor', 'nombre email avatar')
      .sort({ fechaCreacion: -1 })
      .exec();
  }

  async actualizar(id: string, actualizarPublicacionDto: ActualizarPublicacionDto, usuarioId: string): Promise<PublicacionDocument | null> {
    const publicacion = await this.publicacionModel.findById(id);
    
    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('Publicación no encontrada');
    }
    
    if (publicacion.autor.toString() !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para actualizar esta publicación');
    }

    return await this.publicacionModel
      .findByIdAndUpdate(id, actualizarPublicacionDto, { new: true })
      .populate('autor', 'nombre email avatar')
      .populate('comentarios.autor', 'nombre email avatar')
      .exec();
  }

  async eliminar(id: string, usuarioId: string): Promise<void> {
    const publicacion = await this.publicacionModel.findById(id);
    
    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('Publicación no encontrada');
    }
    
    if (publicacion.autor.toString() !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta publicación');
    }

    await this.publicacionModel.findByIdAndUpdate(id, { eliminada: true });
  }

  async darLike(id: string, usuarioId: string): Promise<PublicacionDocument | null> {
    const publicacion = await this.publicacionModel.findById(id);
    
    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const userId = new Types.ObjectId(usuarioId);
    const yaLeDioLike = publicacion.likes.some(like => like.toString() === usuarioId);

    if (yaLeDioLike) {
      // Quitar like
      publicacion.likes = publicacion.likes.filter(like => like.toString() !== usuarioId);
    } else {
      // Dar like
      publicacion.likes.push(userId as any);
    }

    await publicacion.save();
    
    return await this.publicacionModel
      .findById(id)
      .populate('autor', 'nombre email avatar')
      .populate('comentarios.autor', 'nombre email avatar')
      .exec();
  }

  async agregarComentario(id: string, crearComentarioDto: CrearComentarioDto, usuarioId: string): Promise<PublicacionDocument | null> {
    const publicacion = await this.publicacionModel.findById(id);
    
    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('Publicación no encontrada');
    }

    publicacion.comentarios.push({
      comentario: crearComentarioDto.comentario,
      autor: usuarioId as any,
      fecha: new Date()
    });

    await publicacion.save();
    
    return await this.publicacionModel
      .findById(id)
      .populate('autor', 'nombre email avatar')
      .populate('comentarios.autor', 'nombre email avatar')
      .exec();
  }
}
