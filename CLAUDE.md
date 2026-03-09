# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apple Watch の心拍数データをリアルタイムでブラウザに表示するオーバーレイアプリ。ブリッジサーバーを介して Watch → ブラウザにデータを中継する。

## Commands

- `npm run dev` — Vite 開発サーバー起動（フロントエンドのみ）
- `npm run bridge` — WebSocket ブリッジサーバー起動（`server/bridge.mjs`）
- `npm run start` — ブリッジサーバーとVite開発サーバーを同時起動
- `npm run build` — TypeScript コンパイル + Vite ビルド
- `npm run lint` — ESLint 実行

## Architecture

### データフロー

```
Apple Watch (HDS app) --HTTP PUT--> :3476 bridge.mjs --WebSocket--> :3477 Browser
```

- HDS アプリは `PUT /` で JSON `{"data":"heartRate:74"}` を送信（WebSocket ではない）
- ブラウザへは WebSocket で `heartRate:74` 形式の文字列を配信

### サーバー (`server/bridge.mjs`)

- **ポート 3476 (HTTP)**: Watch/HDS アプリからの `PUT /` 受信用
- **ポート 3477 (WebSocket)**: ブラウザクライアントへの配信用

Watch から HTTP PUT で受信したデータを全ブラウザクライアントに WebSocket で中継するリレー。

### フロントエンド (React + TypeScript + Vite)

- `useHDS` hook がブリッジサーバー（ポート 3477）に WebSocket 接続し、心拍数データを受信
- `useHeartRate` は `useHDS` のラッパー（将来的にデータソース切り替え用）
- 接続状態管理: `loading` → `live` → `stale`（5秒無信号）/ `disconnected` / `error`
- 自動再接続: 1s → 2s → 5s → 10s の段階的バックオフ

### 心拍数ゾーン (`src/utils/heartRateUtils.ts`)

| ゾーン | BPM範囲 | カラー |
|--------|---------|--------|
| rest | ≤59 | `#0D9488` (teal) |
| normal | 60-99 | `#10B981` (emerald) |
| elevated | 100-129 | `#F59E0B` (amber) |
| high | 130-159 | `#EF4444` (red) |
| extreme | 160+ | `#DC2626` (dark red + glow) |

### UI コンポーネント

- `HeartRateDisplay` — メインコンテナ。ステータスメッセージ表示を制御
- `HeartIcon` — SVGハートアイコン。BPM に連動したアニメーション速度、extreme ゾーンでグロー効果
- `BpmText` — BPM 数値表示。ゾーンカラーに連動
- フォント: Space Grotesk (`@fontsource/space-grotesk`)
