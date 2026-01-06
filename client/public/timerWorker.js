// Timer Web Worker - runs independently of main thread, less affected by tab throttling
// This worker sends tick messages every second

let intervalId = null;
let endTime = null;

self.onmessage = function (e) {
    const { type, data } = e.data;

    if (type === 'START') {
        endTime = data.endTime;

        // Clear any existing interval
        if (intervalId) {
            clearInterval(intervalId);
        }

        // Send initial tick
        sendTick();

        // Start interval - Web Workers are less throttled than main thread
        intervalId = setInterval(sendTick, 1000);
    }

    if (type === 'STOP') {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
};

function sendTick() {
    if (!endTime) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

    self.postMessage({ type: 'TICK', remaining });

    if (remaining === 0) {
        self.postMessage({ type: 'TIME_UP' });
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
}
