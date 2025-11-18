import { z } from "zod";

export const ClaseFrontMatterSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    languages: z.array(z.string()).optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    duration: z.string().optional(),
    index: z.boolean().default(true),
});

export type ClaseFrontMatter = z.infer<typeof ClaseFrontMatterSchema>;
