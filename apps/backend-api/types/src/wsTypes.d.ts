export interface SendMessage {
    message: string;
}
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
export type StartTextStream = {
    type: "stream-start";
};
export type textStream = {
    type: "stream";
    message: string;
};
export type WsMsg = GeneratingStatus | ChatMessage | StartTextStream | textStream;
