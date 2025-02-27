import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { extractToken } from './ults/auth.extract';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Token não encontrado.');
    }

    try {
      const tokenPayload = await this.jwtService.verifyAsync(token);

      if (!tokenPayload?.sub || !tokenPayload?.username) {
        throw new UnauthorizedException('Token inválido.');
      }

      request.user = {
        userId: tokenPayload.sub,
        username: tokenPayload.username,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
