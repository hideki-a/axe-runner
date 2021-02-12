# axe-runner

[![npm version](https://badge.fury.io/js/axe-runner.svg)](https://badge.fury.io/js/axe-runner)

Puppeteerとaxe-coreで複数ページのアクセシビリティ検証を行い、結果をCSVファイルに出力します。

## 使用方法

事前にテスト対象のURLを[XML形式のサイトマップ](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap?hl=ja)、もしくは1行1URLでURLを列挙したテキストファイルで準備してください。  
結果は`report`ディレクトリに格納されます。

1. `npm install --save-dev axe-runner`でインストールします
1. `npx axe-runner [filename of url list]`を実行します（例： `npx axe-runner urls.txt`）

### エミュレートに使用するデバイスの設定

`-d`オプションで指定します。

`npx axe-runner -d [デバイスの設定] [filename of url list]`

- `-d`オプションを何も指定しない場合はビューポートが幅1280px、高さ800pxのパソコン相当の設定になります
- `iphone`を指定した場合はiPhone 11（ポートレート表示）相当の設定になります
- `.json`で終わるファイルパスを指定するとそのファイルの設定を読みこみます

設定の詳細はPuppeteerの[DeviceDescriptors.ts](https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts)や[page
.emulate(options)](https://pptr.dev/#?product=Puppeteer&version=v7.0.4&show=api-pageemulateoptions)の情報を参考にしてください。  
あくまでもユーザーエージェントやビューポートの幅・高さなどが変わるだけで、ブラウザのエンジンが変わるわけではないことに注意してください。

#### デバイスの設定例

```json
{
    "name": "iPhone SE landscape",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
    "viewport": {
      "width": 568,
      "height": 320,
      "deviceScaleFactor": 2,
      "isMobile": true,
      "hasTouch": true,
      "isLandscape": true
    }
}
```

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
