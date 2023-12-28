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

ローカルにts-nodeがインストールされていなければインストール
```bash
npm install -g ts-node
```
MinIO (S3エミュレータとして利用)を初期化
```bash
npm run dev-minio-init
```

OpenSearchを初期化
```bash
npm run dev-opensearch-init
```

開発サーバーを起動
```bash
npm run dev
```

[http://localhost:8800](http://localhost:8800)にアクセスするとDemoiceの開発環境が立ち上がっている。ポートはNGINX_PORT
環境変数で変更可能。