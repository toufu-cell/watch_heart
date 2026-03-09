export type ConnectionStatus = 'loading' | 'live' | 'stale' | 'disconnected' | 'error';

export type ErrorReason = 'socket-failed' | 'unknown';

export type HeartRateZone = 'rest' | 'normal' | 'elevated' | 'high' | 'extreme';

export interface HeartRateState {
    bpm: number | null;
    measuredAt: number | null;
    status: ConnectionStatus;
    errorReason?: ErrorReason;
}
