import { HeartIcon } from './HeartIcon';
import { BpmText } from './BpmText';
import { getZone, getZoneColor } from '../utils/heartRateUtils';
import type { ErrorReason, HeartRateState } from '../types';

interface HeartRateDisplayProps {
    state: HeartRateState;
}

const STATUS_MESSAGES: Record<string, string> = {
    loading: 'Connecting...',
    disconnected: 'Reconnecting...',
};

const ERROR_MESSAGES: Record<ErrorReason, string> = {
    'socket-failed': 'WebSocket Failed',
    'unknown': 'Connection Error',
};

const INACTIVE_COLOR = '#6B7280';

export function HeartRateDisplay({ state }: HeartRateDisplayProps) {
    const { bpm, status, errorReason } = state;
    const isActive = (status === 'live' || status === 'stale') && bpm !== null;
    const color = isActive ? getZoneColor(bpm) : INACTIVE_COLOR;
    const zone = isActive ? getZone(bpm) : null;
    const beatDuration = isActive && bpm > 0 ? 60 / bpm : 1;
    const statusMessage = status === 'error'
        ? ERROR_MESSAGES[errorReason ?? 'unknown']
        : STATUS_MESSAGES[status];

    return (
        <div className="heart-rate-display">
            <HeartIcon
                color={color}
                animate={isActive}
                beatDuration={beatDuration}
                glow={zone === 'extreme'}
            />
            <BpmText bpm={isActive ? bpm : null} color={color} />
            {statusMessage && <div className="status-message">{statusMessage}</div>}
        </div>
    );
}
