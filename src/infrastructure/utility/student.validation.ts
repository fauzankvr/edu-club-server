import { z } from "zod";

export const studentSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces")
    .nonempty("First name is required"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces")
    .nonempty("Last name is require"),
  email: z
    .string()
    .trim()
    .email("Enter valid email")
    .nonempty("Email is require"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one lowercase letter, one number, and one special character"
    )
  .nonempty("Password is require")
});