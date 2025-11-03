import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PublicacionService } from '../../services/publicacion.service';
import { AuthService } from '../../services/auth.service';
import { Publicacion, Comentario } from '../../models/publicacion.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.scss']
})
export class PublicacionesComponent implements OnInit {
  publicaciones: Publicacion[] = [];
  nuevaPublicacionForm: FormGroup;
  comentariosForms: { [key: string]: FormGroup } = {};
  showComments: { [key: string]: boolean } = {};
  currentUser: User | null = null;
  isCreatingPost = false;
  showNewPostForm = false;

  constructor(
    private fb: FormBuilder,
    private publicacionService: PublicacionService,
    public authService: AuthService
  ) {
    this.nuevaPublicacionForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      contenido: ['', [Validators.required, Validators.minLength(10)]],
      imagen: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    this.publicacionService.getPublicaciones().subscribe({
      next: (publicaciones) => {
        this.publicaciones = publicaciones;
        // Inicializar formularios de comentarios para cada publicación
        this.publicaciones.forEach(pub => {
          if (pub.id) {
            this.comentariosForms[pub.id] = this.fb.group({
              comentario: ['', [Validators.required, Validators.minLength(1)]]
            });
            this.showComments[pub.id] = false;
          }
        });
      }
    });
  }

  toggleNewPostForm() {
    this.showNewPostForm = !this.showNewPostForm;
    if (!this.showNewPostForm) {
      this.nuevaPublicacionForm.reset();
    }
  }

  crearPublicacion() {
    if (this.nuevaPublicacionForm.valid && this.currentUser) {
      this.isCreatingPost = true;
      
      const nuevaPublicacion = {
        ...this.nuevaPublicacionForm.value,
        autor: this.currentUser.id!
      };

      this.publicacionService.crearPublicacion(nuevaPublicacion).subscribe({
        next: (publicacion) => {
          this.cargarPublicaciones();
          this.nuevaPublicacionForm.reset();
          this.showNewPostForm = false;
          this.isCreatingPost = false;
        },
        error: (error) => {
          console.error('Error al crear publicación:', error);
          this.isCreatingPost = false;
        }
      });
    }
  }

  toggleLike(publicacionId: string) {
    if (this.currentUser?.id) {
      this.publicacionService.darLike(publicacionId).subscribe({
        next: () => {
          this.cargarPublicaciones();
        }
      });
    }
  }

  hasLiked(publicacion: Publicacion): boolean {
    return this.currentUser?.id ? publicacion.likes.includes(this.currentUser.id) : false;
  }

  toggleComments(publicacionId: string) {
    this.showComments[publicacionId] = !this.showComments[publicacionId];
  }

  agregarComentario(publicacionId: string) {
    const form = this.comentariosForms[publicacionId];
    if (form?.valid && this.currentUser?.id) {
      const comentario = {
        comentario: form.value.comentario
      };

      this.publicacionService.agregarComentario(publicacionId, comentario).subscribe({
        next: () => {
          this.cargarPublicaciones();
          form.reset();
        }
      });
    }
  }

  getAuthorName(autorId: string): string {
    // En una implementación real, buscaríamos el usuario por ID
    return this.currentUser?.nombre + ' ' + this.currentUser?.apellido || 'Usuario';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout(): void {
    this.authService.logout();
    // Redirigir al login si es necesario
  }
}