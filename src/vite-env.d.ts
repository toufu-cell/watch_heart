/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_HDS_SERVER_IP?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
