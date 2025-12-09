import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SiswaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (user.role !== 'SISWA' && user.role !== 'ADMIN')) {
      throw new ForbiddenException('Siswa access required');
    }

    return true;
  }
}
