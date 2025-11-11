import { 
  Controller, 
  Get, 
  Post,
  Delete,
  Patch, 
  Body, 
  Param,
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { UsersService } from './users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RegisterDto } from '../auth/dto/register.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return await this.usersService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('imagenPerfil', {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Solo se permiten archivos de imagen'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async updateProfile(
    @Body() updateData: any,
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file, 'perfiles');
      updateData.imagenPerfil = result.secure_url;
    }
    return await this.usersService.update(req.user.id, updateData);
  }

  // Endpoints de administración de usuarios (solo administradores)

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllUsers() {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createUser(@Body() createUserDto: RegisterDto & { perfil?: string }) {
    // Validar si el correo ya existe
    const existingEmail = await this.usersService.findByEmail(createUserDto.correo);
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Validar si el nombre de usuario ya existe
    const existingUsername = await this.usersService.findByUsername(createUserDto.nombreUsuario);
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }

    // Validar edad (mayor de 13 años)
    const birthDate = new Date(createUserDto.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      throw new BadRequestException('El usuario debe ser mayor de 13 años');
    }

    // Validar contraseña
    const hasUppercase = /[A-Z]/.test(createUserDto.contraseña);
    const hasNumber = /\d/.test(createUserDto.contraseña);
    const hasMinLength = createUserDto.contraseña.length >= 8;
    
    if (!(hasUppercase && hasNumber && hasMinLength)) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
    }

    const user = await this.usersService.createUserAsAdmin(createUserDto);
    
    // Remover la contraseña del objeto de respuesta
    const { contraseña, ...userWithoutPassword } = (user as any).toObject();
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deactivateUser(@Param('id') id: string) {
    return await this.usersService.deactivate(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/activar')
  async activateUser(@Param('id') id: string) {
    return await this.usersService.activate(id);
  }
}
