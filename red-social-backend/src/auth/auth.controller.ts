import { Controller, Post, Body, UseInterceptors, UploadedFile, ValidationPipe, HttpStatus, HttpCode, BadRequestException, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil', {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Solo se permiten archivos JPG, JPEG y PNG'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async register(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Encontrar el campo de contraseña (puede venir con encoding issues)
    const passwordKey = Object.keys(body).find(key => 
      key === 'contraseña' || key.includes('contrase')
    );
    const password = passwordKey ? body[passwordKey] : undefined;
    
    // Construir el DTO manualmente desde el body
    const registerDto: RegisterDto = {
      nombre: body.nombre,
      apellido: body.apellido,
      correo: body.correo,
      nombreUsuario: body.nombreUsuario,
      contraseña: password,
      fechaNacimiento: body.fechaNacimiento,
      descripcionBreve: body.descripcionBreve,
    };
    
    // Validar el DTO
    const dtoInstance = plainToInstance(RegisterDto, registerDto);
    const errors = await validate(dtoInstance);
    
    if (errors.length > 0) {
      const messages = errors.map(error => Object.values(error.constraints || {})).flat();
      throw new BadRequestException(messages);
    }
    
    let imagenPerfil: string | undefined;
    
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file, 'perfiles');
      imagenPerfil = result.secure_url;
    }
    
    return this.authService.register(registerDto, imagenPerfil);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('autorizar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async autorizar(@Request() req) {
    // Si llega aquí, el token es válido (JwtAuthGuard lo validó)
    return this.authService.getUserData(req.user.id);
  }

  @Post('refrescar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refrescar(@Request() req) {
    // Si llega aquí, el token es válido (JwtAuthGuard lo validó)
    return this.authService.refreshToken(req.user.id);
  }
}