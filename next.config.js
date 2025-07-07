/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    'https://6000-firebase-studio-1750253978523.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev',
    'http://6000-firebase-studio-1750253978523.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;
