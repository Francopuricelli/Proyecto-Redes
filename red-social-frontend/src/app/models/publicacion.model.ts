export interface Publicacion {
  id?: string;
  titulo: string;
  contenido: string; // Cambiado de 'mensaje' a 'contenido' para coincidir con backend
  imagen?: string;
  autor: string; // ID del usuario
  fechaCreacion: Date;
  likes: string[]; // Array de IDs de usuarios que dieron like
  comentarios: Comentario[];
}

export interface Comentario {
  id?: string;
  comentario: string; // Cambiado de 'mensaje' a 'comentario' para coincidir con backend
  autor: string; // ID del usuario
  fecha: Date; // Cambiado de 'fechaCreacion' a 'fecha' para coincidir con backend
}