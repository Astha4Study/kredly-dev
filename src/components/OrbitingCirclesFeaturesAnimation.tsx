import { FaBehance, FaGithub } from 'react-icons/fa';
import { FaSquareUpwork } from 'react-icons/fa6';
import { SiIndeed, SiGlassdoor } from 'react-icons/si';
import { OrbitingCircles } from './ui/orbiting-circles';

export function OrbitingCirclesFeaturesAnimation() {
  return (
    <div className="relative flex h-280 w-full flex-col items-center justify-center overflow-hidden">
      {/* Center Label */}
      <div className="absolute z-10 flex h-20 w-20 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
        <span className="text-sm font-semibold">Kredly</span>
      </div>

      {/* Orbit 1 - Inner */}
      <OrbitingCircles iconSize={52} radius={140}>
        <Icons.infojobs />
        <Icons.linkedin />
        <SiIndeed />
        <SiGlassdoor />
      </OrbitingCircles>

      {/* Orbit 2 - Middle */}
      <OrbitingCircles iconSize={38} radius={220} reverse speed={1.5}>
        <Icons.linkedin />
        <SiIndeed />
        <Icons.infojobs />
        <SiGlassdoor />
      </OrbitingCircles>

      {/* Orbit 3 - Outer */}
      <OrbitingCircles iconSize={46} radius={300} reverse speed={2}>
        <Icons.infojobs />
        <FaSquareUpwork />
        <FaGithub />
        <FaBehance />
      </OrbitingCircles>
    </div>
  );
}

const Icons = {
  linkedin: () => (
    <svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 256">
      <path
        d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
        fill="#0A66C2"
      />
    </svg>
  ),
  infojobs: () => (
    <svg
      xmlSpace="preserve"
      id="infojobs_logo__Logo_reduced"
      x="0"
      y="0"
      version="1.1"
      viewBox="0 0 138 136.1"
    >
      <path
        id="infojobs_logo__BG"
        d="M138 113c0 12.8-10.3 23.1-23.1 23.1H23.1C10.3 136.1 0 125.7 0 113V23.1C0 10.3 10.3 0 23.1 0h91.8C127.7 0 138 10.3 138 23.1V113z"
        style={{ fill: '#167db7' }}
      />
      <g id="infojobs_logo__IJ">
        <path d="M57.9 89.3c-.1.7-.7 1.2-1.5 1.2H45.3c-.7 0-1.3-.4-1.3-1.1l.1-.2 7.1-59.3c.1-.7.2-1 1-1.1h12c.6 0 .9.4.9 1v.2l-7.2 59.3zM86.2 91.3c-1.6 12.9-9.7 15.9-19.4 15.9-5.7 0-6.5-.2-8-.4-.7-.1-1.5-.2-1.5-1.3v-.5l.6-4.8c.2-1.4.7-1.7 2-1.7 1.2-.1 2.7-.1 4.5-.2 4.3-.2 7.3-.6 8.1-6.7L80 30c.1-.7.7-1.1 1.4-1.2l11.3.2h.2c.7 0 1 .4 1 1l-7.7 61.3z" />
      </g>
    </svg>
  ),
};
