import { z } from 'zod';

// Zod schemas for API validation
export const userValidation = {
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform(val => val.trim().replace(/[<>]/g, '')),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .transform(val => val.trim().toLowerCase().replace(/[<>]/g, '')),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .transform(val => val.trim()),
};

export const loginValidation = {
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .transform(val => val.trim().toLowerCase()),
  
  password: z.string()
    .min(1, 'Password is required')  
};


// For creating/updating users via API
export const createUserSchema = z.object({
  username: userValidation.username,
  email: userValidation.email,
  password: userValidation.password,
});

// For Login via API
export const loginUserSchema = z.object({
  email: loginValidation.email,
  password: loginValidation.password,
});

// For updates (all fields optional)
export const updateUserSchema = z.object({
  username: userValidation.username.optional(),
  email: userValidation.email.optional(),
  password: userValidation.password.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;