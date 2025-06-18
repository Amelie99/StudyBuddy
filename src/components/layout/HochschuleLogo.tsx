import type { SVGProps } from 'react';

const HochschuleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    aria-labelledby="hawLogoTitle"
    role="img"
    {...props}
  >
    <title id="hawLogoTitle">Logo Hochschule Landshut</title>
    <rect width="200" height="50" fill="hsl(var(--primary))" rx="5" ry="5" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="hsl(var(--primary-foreground))"
      fontSize="16"
      fontWeight="bold"
      fontFamily="Arial, sans-serif"
    >
      HAW Landshut
    </text>
  </svg>
);

export default HochschuleLogo;
