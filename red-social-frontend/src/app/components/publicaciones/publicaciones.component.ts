import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PublicacionService } from '../../services/publicacion.service';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { Publicacion, Comentario } from '../../models/publicacion.model';
import { User } from '../../models/user.model';
import Swal from 'sweetalert2';

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
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private publicacionService: PublicacionService,
    public authService: AuthService,
    private imageService: ImageService
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
        console.log('Publicaciones cargadas:', publicaciones);
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
      this.clearImage();
    }
  }

  // Seleccionar imagen desde galería
  selectFromGallery() {
    this.imageService.selectFromGallery({ 
      maxWidth: 1920, 
      maxHeight: 1080, 
      quality: 0.8 
    }).subscribe({
      next: (file) => {
        if (file) {
          this.handleSelectedImage(file);
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al seleccionar la imagen: ' + error,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Tomar foto con la cámara
  takePhoto() {
    this.imageService.takePhoto({ 
      maxWidth: 1920, 
      maxHeight: 1080, 
      quality: 0.8 
    }).subscribe({
      next: (file) => {
        if (file) {
          this.handleSelectedImage(file);
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error de cámara',
          text: 'No se pudo acceder a la cámara: ' + error,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Manejar imagen seleccionada
  private handleSelectedImage(file: File) {
    this.selectedImageFile = file;
    
    // Crear preview
    this.imageService.fileToBase64(file).subscribe({
      next: (base64) => {
        this.imagePreview = base64;
      },
      error: (error) => {
        console.error('Error al crear preview:', error);
      }
    });
  }

  // Limpiar imagen seleccionada
  clearImage() {
    this.selectedImageFile = null;
    this.imagePreview = null;
  }

  // Mostrar opciones de imagen
  showImageOptions() {
    Swal.fire({
      title: 'Agregar Imagen',
      text: 'Selecciona una opción:',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '📱 Tomar Foto',
      denyButtonText: '🖼️ Desde Galería',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#007bff',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.takePhoto();
      } else if (result.isDenied) {
        this.selectFromGallery();
      }
    });
  }

  crearPublicacion() {
    if (this.nuevaPublicacionForm.valid && this.currentUser) {
      this.isCreatingPost = true;
      
      // Crear FormData para enviar archivo de imagen
      const formData = new FormData();
      formData.append('titulo', this.nuevaPublicacionForm.value.titulo);
      formData.append('contenido', this.nuevaPublicacionForm.value.contenido);
      formData.append('autor', this.currentUser.id!);
      
      // Agregar imagen si existe
      if (this.selectedImageFile) {
        formData.append('imagen', this.selectedImageFile, this.selectedImageFile.name);
      }

      this.publicacionService.crearPublicacion(formData).subscribe({
        next: (publicacion) => {
          console.log('Publicación creada:', publicacion);
          this.cargarPublicaciones();
          this.nuevaPublicacionForm.reset();
          this.clearImage();
          this.showNewPostForm = false;
          this.isCreatingPost = false;
          
          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: '¡Publicación creada!',
            text: 'Tu publicación se ha compartido correctamente',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (error) => {
          console.error('Error al crear publicación:', error);
          this.isCreatingPost = false;
          
          // Mostrar mensaje de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear la publicación. Intenta nuevamente.',
            confirmButtonColor: '#dc3545'
          });
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