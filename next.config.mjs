/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // À compléter avec le domaine du CDN/hébergeur d'images si besoin en V2
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
