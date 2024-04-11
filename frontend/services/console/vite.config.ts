import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(async({ command, mode }) => {
    return {
        build: {
            manifest: true,
        },
        resolve: {
            alias: {
                '~': path.resolve(__dirname, 'src'),
            },
        },
        define: {
            __DEV__: JSON.stringify(process.env.YENV === 'development'),
            __TEST__: JSON.stringify(process.env.YENV === 'testing'),
            __PROD__: JSON.stringify(process.env.YENV === 'production'),
        },
        plugins: [
            react(),
        ],
    };
});
