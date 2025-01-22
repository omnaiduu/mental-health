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
                    action: "get" | "prev" | "next";
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
                    action: "get" | "prev" | "next";
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
                    action: "get" | "prev" | "next";
                    id?: number | undefined;
                };
            };
            output: {
                action: "get";
                notes: {
                    title: string | null;
                    time: number;
                    content: never;
                    noteID: number;
                    userID: number | null;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "get" | "prev" | "next";
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
                    action: "get" | "prev" | "next";
                    id?: number | undefined;
                };
            };
            output: {
                action: "next";
                notes: {
                    title: string | null;
                    time: number;
                    content: never;
                    noteID: number;
                    userID: number | null;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "get" | "prev" | "next";
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
                    action: "get" | "prev" | "next";
                    id?: number | undefined;
                };
            };
            output: {
                action: "prev";
                notes: {
                    title: string | null;
                    time: number;
                    content: never;
                    noteID: number;
                    userID: number | null;
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
                    action: "get" | "save";
                    noteID: number;
                    title?: string | undefined;
                    content?: string | undefined;
                };
            };
            output: {
                data: {
                    title: string | null;
                    time: number;
                    content: never;
                    noteID: number;
                    userID: number | null;
                }[];
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                json: {
                    action: "get" | "save";
                    noteID: number;
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
