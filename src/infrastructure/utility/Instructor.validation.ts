import { z } from "zod";

export const instructorValidationSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .nonempty("Email is required"),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
    .nonempty("Full name is required"),

  dateOfBirth: z
    .preprocess(
      (val: unknown) => (typeof val === "string" ? new Date(val) : val),
      z.date()
    )
    .refine(
      (dob) =>
        dob <= new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      { message: "You must be at least 18 years old" }
    ),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .nonempty("Phone number is required"),
  certifications: z
    .array(z.string().trim().url("Each certification must be a valid URL"))
    .min(1, "At least one certification is required"),

  profileImage: z
    .string()
    .trim()
    .url("Invalid profile image URL")
    .optional()
    .or(z.literal("")),

  eduQulification: z
    .string()
    .trim()
    .min(2, "Educational qualification must be at least 2 characters")
    .nonempty("Educational qualification is required"),

  expertise: z
    .array(z.string().trim())
    .min(1, "At least one area of expertise is required"),

  experience: z
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience cannot exceed 50 years"),

  teachingExperience: z
    .number()
    .min(0, "Teaching experience cannot be negative")
    .max(50, "Teaching experience cannot exceed 50 years"),

  languages: z
    .array(z.string().trim())
    .min(1, "At least one language is required"),

  currentPosition: z
    .string()
    .trim()
    .min(2, "Current position must be at least 2 characters")
    .nonempty("Current position is required"),

  workPlace: z
    .string()
    .trim()
    .min(2, "Workplace must be at least 2 characters")
    .nonempty("Workplace is required"),

  Biography: z
    .string()
    .trim()
    .min(50, "Biography must be at least 50 characters")
    .max(1000, "Biography cannot exceed 1000 characters")
    .nonempty("Biography is required"),

  address: z
    .object({
      street: z
        .string()
        .trim()
        .min(5, "Street address must be at least 5 characters")
        .nonempty("Street address is required"),

      city: z
        .string()
        .trim()
        .min(2, "City must be at least 2 characters")
        .regex(/^[a-zA-Z\s]+$/, "City can only contain letters and spaces")
        .nonempty("City is required"),

      state: z
        .string()
        .trim()
        .min(2, "State must be at least 2 characters")
        .nonempty("State is required"),

      country: z
        .string()
        .trim()
        .min(2, "Country must be at least 2 characters")
        .nonempty("Country is required"),

      zipCode: z
        .string()
        .trim()
        .regex(/^[0-9]{5,10}$/, "Invalid zip code format")
        .nonempty("Zip code is required"),
    })
    .refine((addr) => !!addr, { message: "Address is required" }),

  paypalEmail: z
    .string()
    .trim()
    .email("Invalid PayPal email format")
    .nonempty("PayPal email is required"),

  socialMedia: z
    .object({
      twitter: z
        .string()
        .url("Invalid Twitter URL")
        .optional()
        .or(z.literal("")),
      facebook: z
        .string()
        .url("Invalid Facebook URL")
        .optional()
        .or(z.literal("")),
      instagram: z
        .string()
        .url("Invalid Instagram URL")
        .optional()
        .or(z.literal("")),
      youtube: z
        .string()
        .url("Invalid YouTube URL")
        .optional()
        .or(z.literal("")),
    })
    .optional(),
});

export type InstructorValidationType = z.infer<
  typeof instructorValidationSchema
>;


export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one lowercase letter, one number, and one special character"
    ),
});

