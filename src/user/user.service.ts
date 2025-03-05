import {
  ConflictException,
  forwardRef,
  Inject,
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
import { generateRandomCode } from 'src/auth/ults/code';
import { AuthService } from 'src/auth/auth.service';
import { emailDto } from 'src/auth/dto/email.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
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
      throw new ConflictException('This user already exists.');
    }

    const password = await passwordCrypt(createUserDto.password);
    const code = await generateRandomCode(6);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: password,
      code: code,
      isActive: false,
    });

    await this.usersRepository.save(newUser);
    this.authService.sendCode(new emailDto(newUser.email));
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
    const userDecoded = await this.jwtService.verify(token);
    if (!userDecoded) throw new UnauthorizedException();

    if (user.username !== userDecoded.username) {
      throw new UnauthorizedException("You can't delete this user");
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
    const userDecoded = await this.jwtService.verify(token);
    if (!userDecoded) throw new UnauthorizedException();

    if (user.username !== userDecoded.username) {
      throw new UnauthorizedException("You can't change this user");
    }

    if (updateUserDto.password) {
      const password = await passwordCrypt(updateUserDto.password);
      updateUserDto.password = password;
    }

    await this.usersRepository.update(id, updateUserDto);
    return 'Update sucess';
  }
}
