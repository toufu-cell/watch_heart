import { useEffect, useRef, useState } from 'react';
import type { HeartRateState } from '../types';

const BRIDGE_PORT = 3477;
const STALE_THRESHOLD_MS = 5000;
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000];

function getBridgeUrl(): string {
    const host = window.location.hostname || 'localhost';
    return `ws://${host}:${BRIDGE_PORT}`;
}

function parseHeartRate(message: string): number | null {
    const parts = message.split(':');
    if (parts[0] === 'heartRate' && parts.length >= 2) {
        const bpm = Number(parts[1]);
        return Number.isFinite(bpm) ? bpm : null;
    }
    return null;
}

export function useHDS(): HeartRateState {
    const [state, setState] = useState<HeartRateState>({
        bpm: null, measuredAt: null, status: 'loading',
    });
    const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef(0);

    useEffect(() => {
        let cancelled = false;

        const resetStaleTimer = () => {
            if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
            staleTimerRef.current = setTimeout(() => {
                if (!cancelled) setState((prev) => ({ ...prev, status: 'stale' }));
            }, STALE_THRESHOLD_MS);
        };

        const connect = () => {
            if (cancelled) return;

            const url = getBridgeUrl();
            let ws: WebSocket;
            try {
                ws = new WebSocket(url);
            } catch {
                setState({ bpm: null, measuredAt: null, status: 'error', errorReason: 'socket-failed' });
                return;
            }
            wsRef.current = ws;

            ws.onopen = () => {
                if (cancelled) { ws.close(); return; }
                reconnectCountRef.current = 0;
                setState({ bpm: null, measuredAt: null, status: 'loading' });
            };

            ws.onmessage = (event: MessageEvent) => {
                if (cancelled) return;
                const message = typeof event.data === 'string' ? event.data : '';
                const bpm = parseHeartRate(message);
                if (bpm !== null) {
                    setState({
                        bpm,
                        measuredAt: Date.now(),
                        status: 'live',
                    });
                    resetStaleTimer();
                }
            };

            ws.onclose = () => {
                if (cancelled) return;
                if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
                setState((prev) => ({
                    ...prev,
                    status: prev.status === 'error' ? 'error' : 'disconnected',
                }));
                scheduleReconnect();
            };

            ws.onerror = () => {
                // onclose will follow
            };
        };

        const scheduleReconnect = () => {
            if (cancelled) return;
            const delayIndex = Math.min(reconnectCountRef.current, RECONNECT_DELAYS.length - 1);
            const delay = RECONNECT_DELAYS[delayIndex];
            reconnectCountRef.current++;
            reconnectTimerRef.current = setTimeout(connect, delay);
        };

        connect();

        return () => {
            cancelled = true;
            if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.onmessage = null;
                wsRef.current.onerror = null;
                wsRef.current.close();
            }
        };
    }, []);

    return state;
}
