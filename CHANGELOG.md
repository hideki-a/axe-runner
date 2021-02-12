# axe-runner changelog

## 1.3.0

- 一度に多数のリクエストを発行してしまう問題を修正
- ストリームを用いて結果CSVを出力するように改善
- 結果CSVの文字コードをUTF-8に変更
- エミュレートするデバイスを変更可能にする機能を追加
- HTTP 401, 404のURLを表示する機能を追加

## 1.2.0 (2021-02-11)

- [npmに公開](https://www.npmjs.com/package/axe-runner)
- npmに公開した[@hideki_a/axe-reports](https://www.npmjs.com/package/@hideki_a/axe-reports)を使用するように変更
- Basic認証に対応

## 1.1.0 (2021-02-09)

- `npx axe-runner`でテストが実行できるようにコマンドラインスクリプトを追加
- 1行1URLでURLを列挙したテキストファイルへの対応
- 依存するaxe-core, Puppeteerのバージョンを更新

## 1.0.0 (2019-10-29)

- 基本機能を公開
