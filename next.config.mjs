/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '10001',
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5001',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'fini.sk',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'api.fini.sk',
                pathname: '/uploads/**',
            },
        ],
    },
    reactStrictMode: true,
    // ✅ ПРАВИЛЬНО для Next.js 15!
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
};

export default nextConfig;