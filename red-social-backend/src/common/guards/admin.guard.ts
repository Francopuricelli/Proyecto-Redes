import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // El JwtAuthGuard ya validó el token y agregó el user al request
    if (!user) {
      throw new ForbiddenException('No se encontró información del usuario');
    }

    // Verificar si el usuario es administrador
    if (user.perfil !== 'administrador') {
      throw new ForbiddenException('No tiene permisos de administrador');
    }

    return true;
  }
}
