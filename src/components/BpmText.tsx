interface BpmTextProps {
    bpm: number | null;
    color: string;
}

export function BpmText({ bpm, color }: BpmTextProps) {
    return (
        <div className="bpm-text" style={{ color, transition: 'color 0.5s ease-out' }}>
            <span className="bpm-value">{bpm ?? '--'}</span>
            <span className="bpm-label">BPM</span>
        </div>
    );
}
