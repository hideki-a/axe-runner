# axe-runner

[![npm version](https://badge.fury.io/js/axe-runner.svg)](https://badge.fury.io/js/axe-runner)

Puppeteerとaxe-coreで複数ページのアクセシビリティ検証を行い、結果をCSVファイルに出力します。

## 使用方法

事前にテスト対象のURLを[XML形式のサイトマップ](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap?hl=ja)、もしくは1行1URLでURLを列挙したテキストファイルで準備してください。  
結果は`report`ディレクトリに格納されます。

1. `npm install axe-runner`でインストールします
1. `npx axe-runner [filename of url list]`を実行します（例： `npx axe-runner urls.txt`）

### axeやエミュレートに使用するデバイスの設定

カレントディレクトリの`axe-runner.config.js`に記述します。`-c`オプションで別の場所も指定できます。  
設定方法はWikiの[Config File Example](https://github.com/hideki-a/axe-runner/wiki/Config-File-Example)を参照してください。

`npx axe-runner -c [設定ファイルへの相対パス] [filename of url list]`

### Basic認証への対応

`.env`に認証情報を記述します。

```
BASIC_AUTH_USERNAME=ユーザー名
BASIC_AUTH_PASSWORD=パスワード
```

### コマンドライン初心者向け実行環境

コマンドライン操作が苦手な方のために、ワンクリックでaxe-runnerが実行できる環境を用意しました。Wikiの「[コマンドライン初心者向け実行環境](https://github.com/hideki-a/axe-runner/wiki/%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%83%A9%E3%82%A4%E3%83%B3%E5%88%9D%E5%BF%83%E8%80%85%E5%90%91%E3%81%91%E5%AE%9F%E8%A1%8C%E7%92%B0%E5%A2%83)」をご覧ください。

## 補足

- サーバーへのリクエストを行う際、リクエストとリクエストの間に3秒の待機時間を取ります（`interval`で調整可能）

## 参考サイト

開発にあたり参考にしたサイトです。貴重な情報をありがとうございます。

- [axe-core 3.2で検証結果を日本語化する方法 | アクセシビリティBlog | ミツエーリンクス](https://www.mitsue.co.jp/knowledge/blog/a11y/201903/07_1700.html)
- [bjankord/index.js](https://gist.github.com/bjankord/c8afaf345b4499ca3b1267063ce48562)

## 結果を記録したCSVファイル例

<img src="https://www.anothersky.pw/assets/20191030_pic_02_1440w.png" alt="画面キャプチャ：axe-runnerを実行して出力されたCSVの様子" style="width: 640px; height: auto;">
