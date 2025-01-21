import type {
	CoreAssistantMessage,
	CoreSystemMessage,
	CoreToolMessage,
	CoreUserMessage,
} from "ai";

export * from "ai";
export * from "@ai-sdk/google";

export type MessagesStored = 
	CoreSystemMessage | CoreUserMessage | CoreAssistantMessage | CoreToolMessage

