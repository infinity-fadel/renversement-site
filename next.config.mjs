/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Partage par tunnel (ngrok / cloudflared) pendant les revues client.
  // En mode `dev`, Next 15 refuse les requêtes internes venues d'une autre
  // origine que localhost : sans ces motifs, la page s'affiche mais le HMR et
  // les ressources `/_next/*` sont bloqués, et on croit à un site cassé.
  // Sans effet sur `next build` / `next start`, qui n'ont pas cette garde.
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
    "*.trycloudflare.com",
  ],
  images: {
    // À compléter avec le domaine du CDN/hébergeur d'images si besoin en V2
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
