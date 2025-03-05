import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/User.entity';
import { TokenModule } from './token/token.module';
import { Token } from './token/token.entity';
import { TaskModule } from './task/task.module';
import { DayService } from './day/day.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Token],
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
    EmailModule,
    TokenModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService, DayService],
})
export class AppModule {}
