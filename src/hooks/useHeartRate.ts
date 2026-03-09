import { useHDS } from './useHDS';
import type { HeartRateState } from '../types';

export function useHeartRate(): HeartRateState {
    return useHDS();
}
