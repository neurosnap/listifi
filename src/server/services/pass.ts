import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPass = (
  password: string,
  salt = SALT_ROUNDS,
): Promise<string> =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

export const comparePass = (password: string, hash: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
