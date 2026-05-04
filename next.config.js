/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'localhost',
            'supabase.co',
            'avatars.githubusercontent.com',
            'lh3.googleusercontent.com',
            'via.placeholder.com',
        ],
    },
};

module.exports = withPWA(nextConfig);
