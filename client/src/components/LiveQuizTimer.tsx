// Live Quiz Timer Component - with Web Worker for unthrottled background updates
import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface LiveQuizTimerProps {
    endTime: Date;
    onTimeUp?: () => void;
}

const LiveQuizTimer = ({ endTime, onTimeUp }: LiveQuizTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const workerRef = useRef<Worker | null>(null);
    const onTimeUpRef = useRef(onTimeUp);

    // Keep callback ref updated
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    const calculateTimeLeft = useCallback(() => {
        const now = Date.now();
        const end = endTime.getTime();
        const diff = Math.max(0, end - now);
        return Math.floor(diff / 1000);
    }, [endTime]);

    useEffect(() => {
        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Try to use Web Worker for unthrottled updates
        try {
            const worker = new Worker('/timerWorker.js');
            workerRef.current = worker;

            worker.onmessage = (e) => {
                const { type, remaining } = e.data;

                if (type === 'TICK') {
                    setTimeLeft(remaining);
                }

                if (type === 'TIME_UP') {
                    if (onTimeUpRef.current) {
                        onTimeUpRef.current();
                    }
                }
            };

            worker.onerror = (error) => {
                console.error('Timer worker error:', error);
                // Fallback to regular interval
                startFallbackInterval();
            };

            // Start the worker
            worker.postMessage({
                type: 'START',
                data: { endTime: endTime.getTime() }
            });

            return () => {
                worker.postMessage({ type: 'STOP' });
                worker.terminate();
            };
        } catch (error) {
            console.log('Web Worker not supported, using fallback');
            return startFallbackInterval();
        }

        function startFallbackInterval() {
            const interval = setInterval(() => {
                const newTimeLeft = calculateTimeLeft();
                setTimeLeft(newTimeLeft);

                if (newTimeLeft === 0) {
                    if (onTimeUpRef.current) {
                        onTimeUpRef.current();
                    }
                    clearInterval(interval);
                }
            }, 1000);

            // Still add visibility change handler for fallback
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    const newTimeLeft = calculateTimeLeft();
                    setTimeLeft(newTimeLeft);
                    if (newTimeLeft === 0 && onTimeUpRef.current) {
                        onTimeUpRef.current();
                    }
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                clearInterval(interval);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [endTime, calculateTimeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const isLowTime = timeLeft <= 30;
    const isVeryLowTime = timeLeft <= 10;

    return (
        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-2xl transition ${isVeryLowTime
            ? 'bg-red-50 text-red-600 animate-pulse'
            : isLowTime
                ? 'bg-orange-50 text-orange-600'
                : 'bg-blue-50 text-blue-600'
            }`}>
            <Clock className={`w-8 h-8 ${isVeryLowTime ? 'animate-bounce' : ''}`} />
            <span className="font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

export default LiveQuizTimer;
