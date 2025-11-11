import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Controller('seed')
export class SeedController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdminUser(@Body() body: { secretKey?: string }) {
    // Clave secreta de seguridad (cambiar en producción)
    const SECRET_KEY = process.env.ADMIN_SEED_SECRET || 'create-admin-2024';
    
    if (body.secretKey !== SECRET_KEY) {
      return { 
        success: false, 
        message: 'Clave secreta incorrecta' 
      };
    }

    // Verificar si ya existe un admin
    const existingAdmin = await this.usersService.findByEmail('admin@redsocial.com');
    if (existingAdmin) {
      return { 
        success: false, 
        message: 'Ya existe un usuario administrador con este correo',
        admin: {
          correo: existingAdmin.correo,
          nombreUsuario: existingAdmin.nombreUsuario
        }
      };
    }

    // Crear usuario administrador
    const adminData = {
      nombre: 'Administrador',
      apellido: 'Sistema',
      correo: 'admin@redsocial.com',
      nombreUsuario: 'admin',
      contraseña: 'Admin123',
      fechaNacimiento: '1990-01-01',
      descripcionBreve: 'Usuario administrador del sistema',
      perfil: 'administrador' as 'administrador',
      activo: true
    };

    try {
      const admin = await this.usersService.createUserAsAdmin(adminData);
      
      return {
        success: true,
        message: 'Usuario administrador creado exitosamente',
        admin: {
          id: (admin as any)._id,
          correo: admin.correo,
          nombreUsuario: admin.nombreUsuario,
          perfil: admin.perfil,
          credenciales: {
            usuario: 'admin@redsocial.com (o admin)',
            contraseña: 'Admin123'
          }
        },
        nota: '⚠️ IMPORTANTE: Cambia la contraseña después del primer login'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear usuario administrador',
        error: error.message
      };
    }
  }
}
