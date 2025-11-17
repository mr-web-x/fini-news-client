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
    // ❌ Убрали sassOptions - Next.js будет использовать стандартный sass
};

export default nextConfig;