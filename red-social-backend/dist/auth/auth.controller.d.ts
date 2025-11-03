import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, file?: Express.Multer.File): Promise<{
        user: import("../users/schemas/user.schema").User;
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("../users/schemas/user.schema").User;
        access_token: string;
    }>;
}
