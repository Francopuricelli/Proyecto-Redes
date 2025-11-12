import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/schemas/user.schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    private cloudinaryService;
    constructor(usersService: UsersService, jwtService: JwtService, cloudinaryService: CloudinaryService);
    validateAndBuildRegisterDto(body: any, file?: Express.Multer.File): Promise<{
        dto: RegisterDto;
        imagenPerfil?: string;
    }>;
    register(registerDto: RegisterDto, imagenPerfil?: string): Promise<{
        user: User;
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: User;
        access_token: string;
    }>;
    private validatePassword;
    getUserData(userId: string): Promise<any>;
    refreshToken(userId: string): Promise<{
        access_token: string;
    }>;
}
