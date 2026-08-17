/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Les photos de produits voyagent dans le formulaire lui-même.
      // La limite par défaut (1 Mo) refusait dès la deuxième image.
      bodySizeLimit: '12mb',
    },
  },
}

export default nextConfig
