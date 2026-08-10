import type { NextConfig } from 'next';

const configuration: NextConfig = {
  reactStrictMode: true,

  // Sortie autonome : l'image de production n'embarque que le serveur et les
  // modules réellement importés, plutôt que tout `node_modules`.
  output: 'standalone',

  // Le front n'a pas de couche serveur : il appelle l'API directement depuis le
  // navigateur, avec le jeton de l'agent. Aucune donnée d'enquête ne transite
  // par le processus Next, qui ne sert que des fichiers.
  eslint: { ignoreDuringBuilds: true },
};

export default configuration;
