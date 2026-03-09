# Watch Heart

Apple Watch の心拍数をリアルタイムでゲーム配信にオーバーレイ表示するアプリ。

[Health Data Server (HDS)](https://apps.apple.com/us/app/health-data-server/id1496042074) アプリから心拍数を受信し、BPM に応じてゾーンカラーとハートビートアニメーションを表示します。

## セットアップ

```bash
npm install
```

## 使い方

### 1. サーバー起動

```bash
npm run start
```

ブリッジサーバー（ポート 3476）と Vite 開発サーバーが同時に起動します。

### 2. Apple Watch から接続

1. Apple Watch で HDS アプリを開く
2. PC の IP アドレスを入力
3. ワークアウトを開始

Watch と PC は同じ Wi-Fi ネットワークに接続してください。

### 3. OBS に追加

1. OBS の「ソース」→ **＋** → **ブラウザ**
2. URL に `http://localhost:5173` を入力
3. 幅 `300` / 高さ `80` に設定

背景は透過済みなので、心拍数だけがオーバーレイとして表示されます。

## データフロー

```
Apple Watch (HDS) --HTTP PUT--> :3476 bridge.mjs --WebSocket--> :3477 Browser
```

HDS アプリは `PUT /` で `{"data":"heartRate:74"}` を送信し、ブリッジサーバーが WebSocket 経由でブラウザに中継します。

## 心拍数ゾーン

| ゾーン | BPM | カラー |
|--------|-----|--------|
| Rest | ≤59 | Teal |
| Normal | 60-99 | Emerald |
| Elevated | 100-129 | Amber |
| High | 130-159 | Red |
| Extreme | 160+ | Dark Red + Glow |

## コマンド

| コマンド | 説明 |
|----------|------|
| `npm run start` | ブリッジ + 開発サーバー同時起動 |
| `npm run dev` | Vite 開発サーバーのみ |
| `npm run bridge` | ブリッジサーバーのみ |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLint |

## 技術スタック

- React + TypeScript + Vite
- Node.js WebSocket / HTTP ブリッジサーバー
