import { defineConfig } from '@playwright/test';

const VITE_PORT = 5199;

export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    use: {
        baseURL: `http://localhost:${VITE_PORT}`,
    },
    webServer: [
        {
            command: 'node server/bridge.mjs',
            port: 3476,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: `npx vite --port ${VITE_PORT} --strictPort`,
            port: VITE_PORT,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
