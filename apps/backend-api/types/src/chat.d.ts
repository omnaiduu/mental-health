import { type Variables } from ".";
export declare const chat: import("hono/hono-base").HonoBase<{
    Variables: Variables;
}, {
    "/list": {
        $post: {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                chats: never[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                chats: {
                    userID: number;
                    chatID: number;
                    title: string | null;
                    time: number;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/create": {
        $post: {
            input: {
                json: {
                    action: "delete" | "create" | "remember";
                    chatID?: number | undefined;
                    noteID?: number | undefined;
                    messages?: {
                        content: string;
                        role: "user" | "assistant";
                    }[] | undefined;
                    contentToRemember?: string | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    action: "delete" | "create" | "remember";
                    chatID?: number | undefined;
                    noteID?: number | undefined;
                    messages?: {
                        content: string;
                        role: "user" | "assistant";
                    }[] | undefined;
                    contentToRemember?: string | undefined;
                };
            };
            output: {
                redirect: boolean;
                location: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                json: {
                    action: "delete" | "create" | "remember";
                    chatID?: number | undefined;
                    noteID?: number | undefined;
                    messages?: {
                        content: string;
                        role: "user" | "assistant";
                    }[] | undefined;
                    contentToRemember?: string | undefined;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/get/:id": {
        $get: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                data: ({
                    role: "system";
                    content: string;
                    experimental_providerMetadata?: {
                        [x: string]: {
                            [x: string]: any;
                        };
                    } | undefined;
                } | {
                    role: "user";
                    content: string | ({
                        type: "text";
                        text: string;
                        experimental_providerMetadata?: {
                            [x: string]: {
                                [x: string]: any;
                            };
                        } | undefined;
                    } | {
                        type: "image";
                        image: string | {
                            readonly byteLength: number;
                            slice: {};
                            readonly maxByteLength: number;
                            readonly resizable: boolean;
                            resize: {};
                            readonly detached: boolean;
                            transfer: {};
                            transferToFixedLength: {};
                        } | {
                            [x: number]: number;
                            readonly BYTES_PER_ELEMENT: number;
                            readonly buffer: {
                                readonly byteLength: number;
                                slice: {};
                                readonly maxByteLength: number;
                                readonly resizable: boolean;
                                resize: {};
                                readonly detached: boolean;
                                transfer: {};
                                transferToFixedLength: {};
                            } | {
                                readonly byteLength: number;
                                slice: {};
                                readonly growable: boolean;
                                readonly maxByteLength: number;
                                grow: {};
                            };
                            readonly byteLength: number;
                            readonly byteOffset: number;
                            copyWithin: {};
                            every: {};
                            fill: {};
                            filter: {};
                            find: {};
                            findIndex: {};
                            forEach: {};
                            indexOf: {};
                            join: {};
                            lastIndexOf: {};
                            readonly length: number;
                            map: {};
                            reduce: {};
                            reduceRight: {};
                            set: {};
                            slice: {};
                            some: {};
                            sort: {};
                            subarray: {};
                            includes: {};
                            at: {};
                            findLast: {};
                            findLastIndex: {};
                            toSorted: {};
                            with: {};
                        } | {
                            type: "Buffer";
                            data: number[];
                        };
                        mimeType?: string | undefined;
                        experimental_providerMetadata?: {
                            [x: string]: {
                                [x: string]: any;
                            };
                        } | undefined;
                    } | {
                        type: "file";
                        data: string | {
                            readonly byteLength: number;
                            slice: {};
                            readonly maxByteLength: number;
                            readonly resizable: boolean;
                            resize: {};
                            readonly detached: boolean;
                            transfer: {};
                            transferToFixedLength: {};
                        } | {
                            [x: number]: number;
                            readonly BYTES_PER_ELEMENT: number;
                            readonly buffer: {
                                readonly byteLength: number;
                                slice: {};
                                readonly maxByteLength: number;
                                readonly resizable: boolean;
                                resize: {};
                                readonly detached: boolean;
                                transfer: {};
                                transferToFixedLength: {};
                            } | {
                                readonly byteLength: number;
                                slice: {};
                                readonly growable: boolean;
                                readonly maxByteLength: number;
                                grow: {};
                            };
                            readonly byteLength: number;
                            readonly byteOffset: number;
                            copyWithin: {};
                            every: {};
                            fill: {};
                            filter: {};
                            find: {};
                            findIndex: {};
                            forEach: {};
                            indexOf: {};
                            join: {};
                            lastIndexOf: {};
                            readonly length: number;
                            map: {};
                            reduce: {};
                            reduceRight: {};
                            set: {};
                            slice: {};
                            some: {};
                            sort: {};
                            subarray: {};
                            includes: {};
                            at: {};
                            findLast: {};
                            findLastIndex: {};
                            toSorted: {};
                            with: {};
                        } | {
                            type: "Buffer";
                            data: number[];
                        };
                        mimeType: string;
                        experimental_providerMetadata?: {
                            [x: string]: {
                                [x: string]: any;
                            };
                        } | undefined;
                    })[];
                    experimental_providerMetadata?: {
                        [x: string]: {
                            [x: string]: any;
                        };
                    } | undefined;
                } | {
                    role: "assistant";
                    content: string | ({
                        type: "text";
                        text: string;
                        experimental_providerMetadata?: {
                            [x: string]: {
                                [x: string]: any;
                            };
                        } | undefined;
                    } | {
                        type: "tool-call";
                        toolCallId: string;
                        toolName: string;
                        args: never;
                        experimental_providerMetadata?: {
                            [x: string]: {
                                [x: string]: any;
                            };
                        } | undefined;
                    })[];
                    experimental_providerMetadata?: {
                        [x: string]: {
                            [x: string]: any;
                        };
                    } | undefined;
                } | {
                    role: "tool";
                    content: {
                        type: "tool-result";
                        toolCallId: string;
                        toolName: string;
                        result: never;
                        experimental_content?: ({
                            type: "text";
                            text: string;
                        } | {
                            type: "image";
                            data: string;
                            mimeType?: string | undefined;
                        })[] | undefined;
                        isError?: boolean | undefined;
                        experimental_providerMetadata?: {
                            [x: string]: {
                                [x: string]: any;
                            };
                        } | undefined;
                    }[];
                    experimental_providerMetadata?: {
                        [x: string]: {
                            [x: string]: any;
                        };
                    } | undefined;
                })[];
                redirect: boolean;
                error: null;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/home": {
        $get: {
            input: {};
            output: {
                role: "assistant";
                content: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
}, "/">;
