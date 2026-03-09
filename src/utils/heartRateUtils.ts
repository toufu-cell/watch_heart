import type { HeartRateZone } from '../types';

const ZONE_CONFIG: { zone: HeartRateZone; maxBpm: number; color: string }[] = [
    { zone: 'rest', maxBpm: 59, color: '#0D9488' },
    { zone: 'normal', maxBpm: 99, color: '#10B981' },
    { zone: 'elevated', maxBpm: 129, color: '#F59E0B' },
    { zone: 'high', maxBpm: 159, color: '#EF4444' },
    { zone: 'extreme', maxBpm: Infinity, color: '#DC2626' },
];

export function getZone(bpm: number): HeartRateZone {
    for (const { zone, maxBpm } of ZONE_CONFIG) {
        if (bpm <= maxBpm) return zone;
    }
    return 'extreme';
}

export function getZoneColor(bpm: number): string {
    for (const { maxBpm, color } of ZONE_CONFIG) {
        if (bpm <= maxBpm) return color;
    }
    return '#DC2626';
}
