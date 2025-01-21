import { tool, type CoreTool } from "backend/ai";
import { z } from "zod";

type tools = Record<string, CoreTool>;

const listParam = z.object({
	title: z.string().describe("Title of the list"),
	items: z.array(z.string()).describe("Items to display in the list"),
});

export type ListParam = z.infer<typeof listParam>;
let List = tool({
	description: "Displays A List Of item to user and with title",
	parameters: listParam,
});


const showResultParam = z.object({
  result: z.array(
    z.object({
      category: z.string().describe("Category of the result"),
      shortCategory: z
        .string()
        .describe("Short category of the result, one word"),
      description: z
        .string()
        .describe("Whatever you want to convery should be given here."),
    })
  )
});

export type ShowResultParam = z.infer<typeof showResultParam>;

const showResult = tool({
  description: "Displays the result of the assessment",
  parameters: showResultParam,
})

export const tools: tools = {
	List,
	showResult,
};