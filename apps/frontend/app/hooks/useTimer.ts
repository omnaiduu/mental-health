import { useRef, useState } from "react";

export function useTimer() {
	const [timer, setTimer] = useState({
		seconds: 0,
		minutes: 0,
		hours: 0,
	});

	const timerRef = useRef<any>(null);

	const startTimer = () => {
		if (timerRef.current) return;
		timerRef.current = setInterval(() => {
			setTimer((timer) => {
				const newTimer = { ...timer };
				newTimer.seconds++;
				if (newTimer.seconds === 60) {
					newTimer.seconds = 0;
					newTimer.minutes++;
				}
				if (newTimer.minutes === 60) {
					newTimer.minutes = 0;
					newTimer.hours++;
				}
				return newTimer;
			});
		}, 1000);
	};

	const stopTimer = () => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	};
	return {
		timer,
		startTimer,
		stopTimer,
	};
}
