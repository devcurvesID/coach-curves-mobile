import { z } from "zod";

export const updateAccountSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(4, "Username minimal 4 karakter.")
      .max(30, "Username maksimal 30 karakter.")
      .regex(
        /^[A-Za-z0-9._]+$/,
        "Username hanya boleh berisi huruf, angka, titik, dan underscore.",
      ),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .regex(/[a-z]/, "Password harus memiliki huruf kecil.")
      .regex(/[A-Z]/, "Password harus memiliki huruf besar.")
      .regex(/[0-9]/, "Password harus memiliki angka."),
    verify_password: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.verify_password, {
    message: "Konfirmasi password tidak sama.",
    path: ["verify_password"],
  });

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
