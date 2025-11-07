import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(registerDto: RegisterDto): Promise<User>;
    findOne(id: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByEmail(correo: string): Promise<UserDocument | null>;
    findByUsername(nombreUsuario: string): Promise<UserDocument | null>;
    findByEmailOrUsername(usuario: string): Promise<UserDocument | null>;
    validatePassword(user: UserDocument, password: string): Promise<boolean>;
    update(id: string, updateData: Partial<User>): Promise<User | null>;
}
