import type { Variables } from ".";
export declare const note: import("hono/hono-base").HonoBase<{
    Variables: Variables;
}, {
    "/insert": {
        $post: {
            input: {
                json: {
                    action: "insert" | "delete";
                    noteID?: number | undefined;
                };
            };
            output: {
                redirect: boolean;
                location: string;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "insert" | "delete";
                    noteID?: number | undefined;
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
                    action: "insert" | "delete";
                    noteID?: number | undefined;
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
    "/get": {
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
                action: "get";
                notes: never[];
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
                action: "get";
                notes: {
                    userID: number | null;
                    title: string | null;
                    time: number;
                    noteID: number;
                    content: never;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                action: "next";
                notes: never[];
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
                action: "next";
                notes: {
                    userID: number | null;
                    title: string | null;
                    time: number;
                    noteID: number;
                    content: never;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                action: "prev";
                notes: never[];
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
                action: "prev";
                notes: {
                    userID: number | null;
                    title: string | null;
                    time: number;
                    noteID: number;
                    content: never;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/note": {
        $post: {
            input: {
                json: {
                    noteID: number;
                    action: "get" | "save";
                    title?: string | undefined;
                    content?: string | undefined;
                };
            };
            output: {
                data: {
                    userID: number | null;
                    title: string | null;
                    time: number;
                    noteID: number;
                    content: never;
                }[];
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                json: {
                    noteID: number;
                    action: "get" | "save";
                    title?: string | undefined;
                    content?: string | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        };
    };
}, "/">;
export declare function saveNote(content: string, noteID: number, userID: number, title?: string): Promise<void>;
