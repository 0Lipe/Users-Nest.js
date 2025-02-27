import { User } from '../entity/User.entity';

export class UserDto {
  constructor(user: User) {
    (this.id = user.id),
      (this.email = user.email),
      (this.firtName = user.firstName),
      (this.lastName = user.lastName),
      (this.username = user.username);
  }
  id: number;
  username: string;
  email: string;
  firtName: string;
  lastName: string;
}
