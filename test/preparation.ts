import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// L'adresse de l'API est lue au chargement du client.
process.env.NEXT_PUBLIC_API_URL = 'http://api.test';
