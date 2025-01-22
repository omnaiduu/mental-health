import { type CoreTool } from "backend/ai";
import { z } from "zod";
type tools = Record<string, CoreTool>;
declare const listParam: z.ZodObject<{
    title: z.ZodString;
    items: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    items: string[];
}, {
    title: string;
    items: string[];
}>;
export type ListParam = z.infer<typeof listParam>;
declare const showResultParam: z.ZodObject<{
    result: z.ZodArray<z.ZodObject<{
        category: z.ZodString;
        shortCategory: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: string;
        shortCategory: string;
    }, {
        description: string;
        category: string;
        shortCategory: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    result: {
        description: string;
        category: string;
        shortCategory: string;
    }[];
}, {
    result: {
        description: string;
        category: string;
        shortCategory: string;
    }[];
}>;
export type ShowResultParam = z.infer<typeof showResultParam>;
export declare const tools: tools;
export {};
