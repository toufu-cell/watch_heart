interface HeartIconProps {
    color: string;
    animate: boolean;
    beatDuration: number;
    glow: boolean;
}

export function HeartIcon({ color, animate, beatDuration, glow }: HeartIconProps) {
    const style: React.CSSProperties = {
        '--beat-duration': `${beatDuration}s`,
        '--heart-color': color,
        filter: glow ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color})` : 'none',
        transition: 'filter 0.5s ease-out',
    } as React.CSSProperties;

    return (
        <svg
            className={`heart-icon ${animate ? 'heart-beating' : ''}`}
            style={style}
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill={color}
        >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}
