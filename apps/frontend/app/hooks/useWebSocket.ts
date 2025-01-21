import { useState, useEffect, useCallback, useRef } from "react";

interface WebSocketHookOptions {
	url: string;
	onMessage?: (data: any) => void;
}

interface WebSocketHookResult {
	isDisconnected: boolean;
	isConnecting: boolean;
	error: string | null;
	connect: () => void;
	sendMessage: (message: string) => void;
}

export function useWebSocket({
	url,
	onMessage,
}: WebSocketHookOptions): WebSocketHookResult {
	const [isDisconnected, setIsDisconnected] = useState(true);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const socketRef = useRef<WebSocket | null>(null);

	const connect = useCallback(() => {
		if (socketRef.current?.readyState === WebSocket.OPEN) return;

		setIsConnecting(true);
		setError(null);

		const socket = new WebSocket(url);

		socket.onopen = () => {
			setIsDisconnected(false);
			setIsConnecting(false);
		};

		socket.onmessage = (event) => {
			if (onMessage) {
				onMessage(event.data);
			}
		};

		socket.onerror = () => {
			setError("Oops, you've been disconnected, but your conversation can be re-established");
			setIsDisconnected(true);
			setIsConnecting(false);
		};

		socket.onclose = (event) => {
			setError(event.reason || "The connection was lost, but we can reconnect.");
			setIsDisconnected(true);
			setIsConnecting(false);
		};

		socketRef.current = socket;
	}, [url, onMessage]);

	const sendMessage = useCallback((message: string) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(message);
		} else {
			console.error("WebSocket is not connected");
		}
	}, []);

	useEffect(() => {
		connect();

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, []);

	return { isDisconnected, isConnecting, error, connect, sendMessage };
}
