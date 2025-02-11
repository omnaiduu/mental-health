import { useEffect, useRef, useState } from "react";
import { useTimer } from "./useTimer";

interface micError {
	type: "error";
	message: string;
}

interface micStatus {
	type: "status";
	message: "idle" | "recording";
}

type mic = micError | micStatus;

type Micprops = {
	AudioSize: number;
	onComplete: (blob: File) => void;
};
export function useMic({ AudioSize, onComplete }: Micprops) {
	const [micStatus, setMicStatus] = useState<mic>({
		type: "status",
		message: "idle",
	});
	const chunks = useRef<Blob[]>([]);
	const RecordedSize = useRef<number>(0);
	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const { startTimer, stopTimer, timer } = useTimer();
	const audioStream = useRef<MediaStream | null>(null);
	const getMimeType = () => {
		const types = ["audio/ogg", "audio/wav", "audio/aac", "audio/aiff", "audio/mp3"];
		return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
	};

	const handleOnComplete = () => {
		
		
		const path = `${crypto.randomUUID()}.webm`;
		const blob = new File(chunks.current, path, {
			type: "audio/webm",
		});
		console.log("recordng", blob);
		onComplete(blob);
	};

	const startRecording = async () => {
		if (mediaRecorder.current) return;

		try {
			audioStream.current = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
		} catch (error) {
			setMicStatus({
				type: "error",
				message: "Error while granting microphone access",
			});
			if (audioStream.current) {
				audioStream.current.getTracks().forEach((track) => track.stop());
			}
			return;
		}
		try {
			const mimeType = getMimeType();
			if (!mimeType) {
				setMicStatus({
					type: "error",
					message:
						"Error while initializing media recorder, no supported mime type",
				});
			}
			mediaRecorder.current = new MediaRecorder(audioStream.current, {
				mimeType: mimeType,
			});
		} catch (error) {
			setMicStatus({
				type: "error",
				message: "Error while initializing media recorder",
			});
			if (audioStream.current) {
				audioStream.current.getTracks().forEach((track) => track.stop());
			}
			return;
		}
		mediaRecorder.current.onerror = (e) => {
			console.log(e);
			setMicStatus({
				type: "error",
				message: "Error while recording audio",
			});
			stopTimer();
			if (audioStream.current) {
				audioStream.current.getTracks().forEach((track) => track.stop());
			}
			return;
		};
		mediaRecorder.current.onstart = () => {
			setMicStatus({
				type: "status",
				message: "recording",
			});
			startTimer();
		};
		mediaRecorder.current.onstop = () => {
			setMicStatus({
				type: "status",
				message: "idle",
			});
			stopTimer();
			handleOnComplete();
		};
		mediaRecorder.current.ondataavailable = (e) => {
			if (e.data.size + RecordedSize.current > AudioSize * 1024 * 1024) {
				mediaRecorder.current?.stop();
				return;
			} else {
				RecordedSize.current += e.data.size;
				chunks.current.push(e.data);
			}
		};
		mediaRecorder.current.start(1000);
	};

	const stopRecording = () => {
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			mediaRecorder.current.stop();
			mediaRecorder.current = null;

			if (audioStream.current) {
				audioStream.current.getTracks().forEach((track) => track.stop());
			}
		}
	};

	useEffect(() => {
		// Cleanup function
		return () => {
			if (audioStream.current) {
				audioStream.current.getTracks().forEach((track) => track.stop());
			}
			if (mediaRecorder.current) {
				mediaRecorder.current.stop();
			}
			chunks.current = [];
			RecordedSize.current = 0;
		};
	}, []);
	return { startRecording, stopRecording, micStatus, timer };
}
