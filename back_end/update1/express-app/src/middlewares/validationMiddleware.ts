import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be atleast 3 characters long.' }),
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  password_hash: z.string().min(6, { message: 'Password must be atleast 6 characters long.' })
});