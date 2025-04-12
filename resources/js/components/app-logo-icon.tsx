import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width="64"
            height="64"
            aria-label="Star icon"
        >
            <style>
                {`
                .star {
                    fill: #ffc107;
                }
                `}
            </style>
            <polygon
                className="star"
                points="32 4 39.09 24.26 60 24.26 42.18 37.74 49.27 58 32 44.52 14.73 58 21.82 37.74 4 24.26 24.91 24.26 32 4"
            />
        </svg>
    );
}
