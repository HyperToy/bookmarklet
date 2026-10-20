# CLAUDE.md

`src/` にブックマークレットのソースを置き、`pnpm build` で `out/` に `javascript:` URL を生成するリポジトリ。

## ビルド

- `out/` は gitignore。`pnpm build`（= `node minimize.js`）で生成する
- 生成物は `javascript:` + percent-encode 済み。中身を読むときは decode する

```
node -e 'const s=require("fs").readFileSync("out/<name>.js","utf-8"); console.log(decodeURIComponent(s.replace(/^javascript:/,"")))'
```

- `PROJECT_NAME` / `NAME` / `username` はプレースホルダ。ブックマーク登録時に手で置換する
- lint / format は `pnpm exec biome check --write <path>`

## `javascript:` URL の制約

ブラウザは `javascript:` URL をパースする際に**タブと改行を除去する**。`minimize-js` は `"\n"` をリテラル改行入りのテンプレートリテラルに変換するため、そのまま登録すると改行が失われて空文字列になる。

`minimize.js` の `encodeForUrl` が改行を `%0A` に、`%` を `%25` に escape してこれを防いでいる。`%` を先に escape するので、`twitter_yearly.js` のようにソース中の `%3A` をそのまま検索クエリへ載せたい場合も意図どおり残る。

ここを変えるときは、生成物を decode して改行が残っているか必ず確認する。

## テストと検証

純粋関数が IIFE 内にあり import できないため自動テストがない（整備は #6）。それまでは手動検証で担保する。

- **生成物を実行する**: decode して `node:vm` に fake DOM を渡して実行する。ブラウザと同じ経路を通るので、ビルド起因の不具合を拾える
- **X の DOM を調べる**: ページを保存して `node scripts/inspect-tweet-html.mjs <html> {summary,articles,text,grep}`
- 検証用の一時スクリプトはリポジトリに入れない。再利用するものは `scripts/` に置く（`.dev/` は gitignore）

## 共通化

純粋関数（`cond` / `isXxxDomain` / 整形関数 / `showMessage` など）は 3 ファイルに同一定義で複製されている。#6 で `src/lib/` に集約するまでは**複製を維持する**。1 ファイルだけ直して差分を作らない。

## DOM 由来の文字列

`encodeURIComponent` は孤立サロゲート（unpaired surrogate）で `URIError` を投げる。DOM から取った文字列は `stripLoneSurrogates` を通してから encode する。

## X の本文取得

- 本文は、URL の status ID を含む `article` 内の `[data-testid="tweetText"]`
- 改行は `<br>` ではなく**テキストノード内の生の `\n`**
- 絵文字は `img` の `alt`。`textContent` / `innerText` では落ちる
- 外部リンクは `aria-hidden` の span に完全な URL が入っている。`a.textContent` の末尾 `…` を除去すれば復元できる
- **末尾の URL はカード表示に置き換わると tweetText から消える**。元 URL は DOM に残らないため `card.wrapper` の t.co リンクで補い、人間が後から張り替える

## Cosense の `?body=`

- `%0A` が改行、行頭 1 スペースがインデント、URL 単独行が埋め込みプレイヤーになる
- ページ名のスペースは `_` に置換する（例: `Twitter_2026-09-01`）
- タイトル整形の仕様は https://scrapbox.io/hazuki-log/bookmarkletのlinkの加工 を参照
