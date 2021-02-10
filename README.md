# axe-runner

Puppeteerとaxe-coreで複数ページのアクセシビリティ検証を行い、結果をCSVファイルに出力します。

## 使用方法

事前に[XML形式のサイトマップ](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap?hl=ja)、もしくは1行1URLでURLを列挙したテキストファイルを準備します。  
結果は`report`ディレクトリに格納されます。

1. `npm install --save-dev axe-runner`でインストールします
1. `npx axe-runner [filename of url list]`を実行します（例： `npx axe-runner urls.txt`）

### Basic認証への対応

`.env`に認証情報を記述します。

```
BASIC_AUTH_USERNAME=ユーザー名
BASIC_AUTH_PASSWORD=パスワード
```

## 参考サイト

開発にあたり参考にしたサイトです。貴重な情報をありがとうございます。

- [axe-core 3.2で検証結果を日本語化する方法 | アクセシビリティBlog | ミツエーリンクス](https://www.mitsue.co.jp/knowledge/blog/a11y/201903/07_1700.html)
- [bjankord/index.js](https://gist.github.com/bjankord/c8afaf345b4499ca3b1267063ce48562)

## 結果を記録したCSVファイル例

<img src="https://www.anothersky.pw/assets/20191030_pic_02_1440w.png" alt="画面キャプチャ：axe-runnerを実行して出力されたCSVの様子" style="width: 640px; height: auto;">
