import { z } from "zod"

export const SignUpValidation = z.object({
    name: z.string().min(2, { message: 'Too Short' }),
    username: z.string().min(2, { message: 'Too SHort' }),
    email: z.string().email(),
    password: z.string().min(8, { message: 'Password must be atleast 8 characters' })
  })

  export const SignInValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: 'Password must be atleast 8 characters' })
  })