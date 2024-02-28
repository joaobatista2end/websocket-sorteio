import { z } from "zod";

const enviromentSchema = z.object({
  PORT: z.number().default(3000),
  HOST: z.string().default("localhost"),
});

export const env = enviromentSchema.parse(process.env);
