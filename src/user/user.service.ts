import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/User.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { passwordCrypt } from 'src/auth/ults/password';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existingUser) {
      throw new ConflictException('Usuário já existe com este nome ou e-mail.');
    }

    const password = await passwordCrypt(createUserDto.password);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: password,
    });

    await this.usersRepository.save(newUser);

    const returnUser = new UserDto(newUser);
    return returnUser;
  }

  async findUserByName(username: string): Promise<User> {
    const users = await this.usersRepository.query(
      'SELECT * FROM users WHERE username = $1',
      [username],
    );
    return users.length > 0 ? users[0] : null;
  }

  async remove(id: number, token: string | null): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();

    if (!token) throw new UnauthorizedException();
    const userDecoded = this.jwtService.decode(token);
    if (!userDecoded) throw new UnauthorizedException();

    if (user.username !== userDecoded.username) {
      throw new UnauthorizedException('Você não pode editar este usuário');
    }
    await this.usersRepository.delete(id);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    token: string | null,
  ): Promise<string> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();

    if (!token) throw new UnauthorizedException();
    const userDecoded = this.jwtService.decode(token);
    if (!userDecoded) throw new UnauthorizedException();

    if (user.username !== userDecoded.username) {
      throw new UnauthorizedException('Você não pode editar este usuário');
    }

    if (updateUserDto.password) {
      const password = await passwordCrypt(updateUserDto.password);
      updateUserDto.password = password;
    }

    await this.usersRepository.update(id, updateUserDto);
    return 'Update sucess';
  }
}
