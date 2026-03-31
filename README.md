# Bedrock Chat

Minecraft Bedrock Dedicated Server (BDS)を起動・管理し、Discord との連携を行うツールです。サーバー内のチャットメッセージを Discord チャンネルと同期できます。

## 概要

このツールは以下の機能を提供します:
- Minecraft BDS サーバーの自動起動・管理
- Discord ボットによるサーバー監視
- サーバーチャット ↔ Discord チャンネル間のメッセージ同期
- プレイヤー管理機能

## 必要な環境

- Node.js (v16 以上推奨)
- Minecraft Bedrock Dedicated Server (BDS)
- Discord Bot Token
- Discord サーバー(ギルド)

## インストール


1. 依存パッケージをインストール
```bash
npm install
```

## 設定方法

### 1. Minecraft Bedrock ワールドの準備

```
config.js をテキストエディタで開く
次のステップに従ってください:

a) Minecraft Bedrock Edition でベータ API を有効にしたワールドを作成
b) そのワールドのフォルダをコピー
c) BDS の `worlds` フォルダに貼り付け
d) BDS の `server.properties` ファイルを開く
e) `level-name` をワールドのフォルダ名に設定
```

### 2. config.js の設定

`config.js` を開いて以下を設定:

```javascript
export default {
    // Discord Bot のトークン ID
    "Token": "your_discord_bot_token_here",
    // メッセージを送信する Discord チャンネルの ID
    "channelid": "your_discord_channel_id_here"
}
```

**取得方法:**
- **Bot Token**: [Discord Developer Portal](https://discord.com/developers/applications) で作成したアプリケーションから取得
- **Channel ID**: Discord で `channelid` を右クリック → ID をコピー (開発者モード有効時)

## 使い方

### サーバーの起動

```bash
node main.js <path-to-bds.exe>
```

**例:**
```bash
node main.js "C:\bds\bedrock_server.exe"
```

- `main.js` にはコマンドライン引数として BDS 実行ファイル(`bedrock_server.exe`)のパスを指定します
- プログラムが自動的に以下を実行:
  - server.properties の設定更新
  - default アドオンの同期
  - Discord ボットのログイン
  - コンソール入出力の管理

### チャット機能

**サーバー → Discord:**
- サーバー内でプレイヤーが送信したメッセージが Discord チャンネルに自動転送

**Discord → サーバー:**
- Discord チャンネルのメッセージが `[D] ユーザー名:メッセージ` の形式でサーバーに表示

## ファイル構造

```
wrapper_chat/
├── config.js              # 設定ファイル (Token, Channel ID など)
├── main.js                # メインプログラム
├── package.json           # プロジェクト情報と依存パッケージ
├── defaultAddon/          # Minecraft スクリプトアドオン
│   ├── manifest.json      # アドオンのマニフェスト
│   └── scripts/
│       └── main.js        # アドオンのメインスクリプト
└── src/                   # ソースコード
    ├── chatmanager.js     # チャット管理 (Minecraft ↔ Discord)
    ├── discord.js         # Discord ボット管理
    └── playermanager.js   # プレイヤー管理
```

## 依存パッケージ

- **discord.js** - Discord ボットライブラリ
- **fs-extra** - ファイルシステム拡張ユーティリティ  
- **properties-reader** - Java プロパティファイルパーサー

## よくある問題

### サーバーが起動しない
- BDS の実行ファイル `bedrock_server.exe` のパスが正しいか確認
- `server.properties` ファイルが存在するか確認

### Discord に接続できない
- `config.js` の Token と Channel ID が正しいか確認
- Bot に必要な権限があるか確認 (メッセージ送信など)
- Discord Developer Portal でメッセージ Intent が有効になっているか確認

### メッセージが同期されない
- BDS のコンソール出力が有効になっているか確認
- `content-log-console-output-enabled` が `true` に設定されているか確認

## ライセンス

MIT

