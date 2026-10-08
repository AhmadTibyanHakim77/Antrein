import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.6"
            >
                <path d="M13 9h10M13 31h10M13 20h18m-5-5 5 5-5 5" />
                <circle
                    cx="8"
                    cy="9"
                    r="2.2"
                    fill="currentColor"
                    stroke="none"
                />
                <circle
                    cx="8"
                    cy="20"
                    r="2.2"
                    fill="currentColor"
                    stroke="none"
                />
                <circle
                    cx="8"
                    cy="31"
                    r="2.2"
                    fill="currentColor"
                    stroke="none"
                />
            </g>
        </svg>
    );
}
