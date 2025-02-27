import * as bcrypt from 'bcrypt';

export async function passwordCrypt(password: string): Promise<string> {
  const saltOrRounds = 10;
  password = await bcrypt.hash(password, saltOrRounds);
  return password;
}
