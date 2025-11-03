import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      contraseña: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]]
    });
  }

  passwordValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasMinLength = value.length >= 8;
    
    if (!hasUppercase || !hasNumber || !hasMinLength) {
      return { invalidPassword: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.router.navigate(['/publicaciones']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName === 'usuario' ? 'Usuario/Correo' : 'Contraseña'} es requerido`;
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${fieldName === 'usuario' ? 'Usuario/Correo' : 'Contraseña'} debe tener al menos ${requiredLength} caracteres`;
      }
      if (control.errors['invalidPassword']) {
        return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
      }
    }
    return '';
  }
}