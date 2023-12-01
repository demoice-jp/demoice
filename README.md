## 初回の開発環境のセットアップ

依存パッケージのインストール
```bash
npm install
```

.env.local.sampleファイルをコピーして.env.localファイルを作成
各設定キーを設定
```bash
cp .env.local.sample .env.local
```

依存サービスを起動
```bash
npm run dev-services
```

データベースをセットアップ
```bash
npm run dev-db-migrate
```

開発サーバーを起動
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)にアクセスするとDemoiceの開発環境が立ち上がっている。
