# axe-runner

Puppeteerとaxe-coreで複数ページのアクセシビリティ検証を行い、結果をCSVファイルに出力します。

## 使用方法

事前に[XML形式のサイトマップ](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap?hl=ja)、もしくは1行1URLでURLを列挙したテキストファイルを準備します。

1. `npm i -D hideki-a/axe-runner`でインストールします（npmjs.comへの登録は検討中です）
1. `npx axe-runner [filename of url list]`を実行します

## 参考サイト

開発にあたり参考にしたサイトです。貴重な情報をありがとうございます。

- [axe-core 3.2で検証結果を日本語化する方法 | アクセシビリティBlog | ミツエーリンクス](https://www.mitsue.co.jp/knowledge/blog/a11y/201903/07_1700.html)
- [bjankord/index.js](https://gist.github.com/bjankord/c8afaf345b4499ca3b1267063ce48562)
