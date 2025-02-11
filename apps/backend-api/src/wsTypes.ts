import type { FilePart, MessagesStored } from "backend/ai";

export interface SendMessage {
	type: "message";
	message: string;
}

export interface SendAudio {
	type: "audio";
	audio: {
		id: string;
		mimeType: string;
		fileName: string;
	};
}

export interface RedirectData {
	redirect?: boolean;
	location?: string;
}

export type receiveMessage = SendAudio | SendMessage;

export interface WebsocketError {
	error: string;
}

export type GeneratingStatus = {
	type: "status";
	isGenerating: boolean;
};

export type ChatMessage = {
	type: "chat";
	message: string;
};

export type CoreMsg = {
	type: "core";
	message: MessagesStored;
};

export type StartTextStream = {
	type: "stream-start";
};

export type textStream = {
	type: "stream";
	message: string;
};

export type WsMsg =
	| GeneratingStatus
	| ChatMessage
	| StartTextStream
	| textStream
	| CoreMsg;
