import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const WATCH_PORT = 3476;
const BROWSER_PORT = 3477;

// Clients connected from browser overlay
const browserClients = new Set();

// WebSocket server for browser clients (overlay reads from here)
const browserServer = new WebSocketServer({ port: BROWSER_PORT });
browserServer.on('listening', () => {
    console.log(`[bridge] Browser relay listening on ws://localhost:${BROWSER_PORT}`);
});
browserServer.on('connection', (ws) => {
    console.log('[bridge] Browser client connected');
    browserClients.add(ws);
    ws.on('close', () => {
        browserClients.delete(ws);
        console.log('[bridge] Browser client disconnected');
    });
});

// HTTP server for Watch/HDS app (receives heart rate data via PUT)
const watchServer = createServer((req, res) => {
    if (req.method === 'PUT') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
            try {
                const { data } = JSON.parse(body);
                console.log(`[bridge] Received: ${data}`);

                // Relay to all browser clients
                for (const client of browserClients) {
                    if (client.readyState === 1) {
                        client.send(data);
                    }
                }
            } catch (e) {
                console.log(`[bridge] Parse error: ${e.message}`);
            }
            res.writeHead(200);
            res.end();
        });
    } else {
        res.writeHead(405);
        res.end();
    }
});

watchServer.listen(WATCH_PORT, '0.0.0.0', () => {
    console.log(`[bridge] Watch receiver listening on http://0.0.0.0:${WATCH_PORT}`);
    console.log('[bridge] Waiting for Apple Watch connection...');
});

console.log('[bridge] HDS Bridge starting...');
