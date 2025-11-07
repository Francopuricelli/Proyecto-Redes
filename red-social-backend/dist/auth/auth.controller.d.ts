import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class AuthController {
    private readonly authService;
    private readonly cloudinaryService;
    constructor(authService: AuthService, cloudinaryService: CloudinaryService);
    register(body: any, file?: Express.Multer.File): Promise<{
        user: import("../users/schemas/user.schema").User;
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("../users/schemas/user.schema").User;
        access_token: string;
    }>;
    autorizar(req: any): Promise<any>;
    refrescar(req: any): Promise<{
        access_token: string;
    }>;
}
