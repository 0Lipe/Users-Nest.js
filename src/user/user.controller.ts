import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { extractToken } from 'src/auth/ults/auth.extract';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() User: CreateUserDto): Promise<UserDto> {
    return this.userService.create(User);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() user: UpdateUserDto,
    @Req() request,
  ): Promise<String> {
    const token = extractToken(request);
    return this.userService.update(id, user, token);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number, @Req() request): Promise<void> {
    const token = extractToken(request);
    return this.userService.remove(id, token);
  }
}
