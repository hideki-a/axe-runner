# axe-runner

[![npm version](https://badge.fury.io/js/axe-runner.svg)](https://badge.fury.io/js/axe-runner)

Puppeteerとaxe-coreで複数ページのアクセシビリティ検証を行い、結果をCSVファイルに出力します。

## 使用方法

事前にテスト対象のURLを[XML形式のサイトマップ](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap?hl=ja)、もしくは1行1URLでURLを列挙したテキストファイルで準備してください。  
結果は`report`ディレクトリに格納されます。

1. `npm install --save-dev axe-runner`でインストールします
1. `npx axe-runner [filename of url list]`を実行します（例： `npx axe-runner urls.txt`）

なお、2021年2月9日より前のようにGitHubからコードをダウンロードして`node index.js [filename of url list] > report.csv`でテストを実行することも可能です。この場合、結果のCSVをExcelで開くには[nkf](https://osdn.net/projects/nkf/)などを用いて文字コードをUTF-8 with BOMもしくはShift_JISに変換する必要があります。

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

## 補足

- サーバーへのリクエストを行う際、リクエストとリクエストの間に3秒の待機時間を取ります

## 参考サイト

開発にあたり参考にしたサイトです。貴重な情報をありがとうございます。

- [axe-core 3.2で検証結果を日本語化する方法 | アクセシビリティBlog | ミツエーリンクス](https://www.mitsue.co.jp/knowledge/blog/a11y/201903/07_1700.html)
- [bjankord/index.js](https://gist.github.com/bjankord/c8afaf345b4499ca3b1267063ce48562)

## 結果を記録したCSVファイル例

<img src="https://www.anothersky.pw/assets/20191030_pic_02_1440w.png" alt="画面キャプチャ：axe-runnerを実行して出力されたCSVの様子" style="width: 640px; height: auto;">
