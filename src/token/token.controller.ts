import { Body, Controller, Put } from '@nestjs/common';
import { RefreshTokenDto } from './dto/refresh.token';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Put('refresh')
  async refreshToken(@Body() refreshTokenDTO: RefreshTokenDto) {
    return this.tokenService.refreshToken(refreshTokenDTO.oldToken);
  }
}
