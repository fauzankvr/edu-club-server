import { z } from "zod";

export const CourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Course title is required")
    .max(50, "Title cannot exceed 50 characters"),

  description: z
    .string()
    .trim()
    .min(200, "Description must be at least 200 characters")
    .max(1700, "Description cannot exceed 1700 characters"),

  language: z.string().trim().min(1, "Language is required"),

  category: z.string().trim().min(1, "Category is required"),

  price: z.number({
   error: "Price must be a number",
  }).min(1, "Actual price is required"),

  discount: z
    .number({ error: "Discount must be a number" })
    .refine((val) => val !== undefined, {
      message: "Discount price is required",
    })
    .nullable()
    .optional(),

  points: z
    .array(
      z.object({
        text: z.string().trim().min(1, "This field is required"),
      })
    )
    .min(1, "At least one point is required"),

  students: z.array(z.string()).optional(), 
  instructor: z.string().nullable().optional(),
  courseImageId: z.string().optional(),
});
