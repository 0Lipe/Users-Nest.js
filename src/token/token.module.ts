import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { TokenController } from './token.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Token]),
    UserModule,
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TypeOrmModule, TokenService],
})
export class TokenModule {}
