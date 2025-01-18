// next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  trailingSlash: true,
  reactStrictMode: false,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias['pdfjs-dist/build/pdf.worker'] = path.resolve(__dirname, 'public/pdf.worker.min.mjs');
    }
    return config;
  },
};
