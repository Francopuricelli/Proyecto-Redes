import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit {
  currentUser: User | null = null;
  perfilForm: FormGroup;
  isEditing = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      fechaNacimiento: ['', [Validators.required]],
      descripcionBreve: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserData();
  }

  loadUserData() {
    if (this.currentUser) {
      this.perfilForm.patchValue({
        nombre: this.currentUser.nombre,
        apellido: this.currentUser.apellido,
        correo: this.currentUser.correo,
        nombreUsuario: this.currentUser.nombreUsuario,
        fechaNacimiento: new Date(this.currentUser.fechaNacimiento).toISOString().split('T')[0],
        descripcionBreve: this.currentUser.descripcionBreve
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (!this.isEditing) {
      // Si cancela la edición, restaurar los datos originales
      this.loadUserData();
    }
  }

  onSubmit() {
    if (this.perfilForm.valid && this.currentUser) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Simular actualización del perfil
      setTimeout(() => {
        const updatedUser: User = {
          ...this.currentUser!,
          ...this.perfilForm.value,
          fechaNacimiento: new Date(this.perfilForm.value.fechaNacimiento)
        };
        
        // Actualizar en localStorage (en implementación real sería una llamada al backend)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUser = updatedUser;
        
        this.isLoading = false;
        this.isEditing = false;
        this.successMessage = 'Perfil actualizado exitosamente';
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }, 1000);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  calculateAge(): number {
    if (!this.currentUser?.fechaNacimiento) return 0;
    
    const birthDate = new Date(this.currentUser.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.perfilForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        const maxLength = control.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} no puede exceder ${maxLength} caracteres`;
      }
      if (control.errors['email']) {
        return 'Ingrese un correo electrónico válido';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nombre': 'Nombre',
      'apellido': 'Apellido',
      'correo': 'Correo electrónico',
      'nombreUsuario': 'Nombre de usuario',
      'fechaNacimiento': 'Fecha de nacimiento',
      'descripcionBreve': 'Descripción breve'
    };
    return labels[fieldName] || fieldName;
  }
}