import type { NextConfig } from 'next';

const configuration: NextConfig = {
  reactStrictMode: true,

  // Le front n'a pas de couche serveur : il appelle l'API directement depuis le
  // navigateur, avec le jeton de l'agent. Aucune donnée d'enquête ne transite
  // par le processus Next, qui ne sert que des fichiers.
  eslint: { ignoreDuringBuilds: true },
};

export default configuration;
