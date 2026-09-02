// 保存した X のページから、bookmarklet が使う DOM 構造を調べる開発用スクリプト。
// 正規表現で走査するだけで DOM パーサではない。構造の当たりをつける用途に限る。
//
//   node scripts/inspect-tweet-html.mjs <html> summary
//   node scripts/inspect-tweet-html.mjs <html> articles
//   node scripts/inspect-tweet-html.mjs <html> text <statusId>
//   node scripts/inspect-tweet-html.mjs <html> grep <word> [context]

import { readFileSync } from "node:fs";

const [, , file, command, ...args] = process.argv;
const commands = { summary, articles, text, grep };

main();

function main() {
	const run = commands[command];
	if (!file || !run) {
		console.error(
			[
				"usage:",
				"  node scripts/inspect-tweet-html.mjs <html> summary",
				"  node scripts/inspect-tweet-html.mjs <html> articles",
				"  node scripts/inspect-tweet-html.mjs <html> text <statusId>",
				"  node scripts/inspect-tweet-html.mjs <html> grep <word> [context]",
			].join("\n"),
		);
		process.exit(1);
	}
	run(readFileSync(file, "utf-8"), ...args);
}

// ページ全体に何がいくつあるかを数える
function summary(html) {
	console.log("bytes:", html.length);
	console.log("article:", count(html, /<article\b/g));
	console.log("tweetText:", count(html, /data-testid="tweetText"/g));
	console.log("card.wrapper:", count(html, /data-testid="card\.wrapper"/g));
	console.log(
		"card testids:",
		unique(html.match(/data-testid="card[^"]*"/g) ?? []).join(" "),
	);
}

// article ごとに status ID・投稿者・カード・t.co リンクを並べる。
// どの article が主ツイートかを status ID で突き止めるのに使う
function articles(html) {
	splitArticles(html).forEach((segment, index) => {
		const links = unique(segment.match(/href="\/[^"]+\/status\/\d+"/g) ?? []);
		console.log(
			[
				`#${index}`,
				`status: ${unique(segment.match(/\/status\/(\d+)/g) ?? []).join(",") || "-"}`,
				`author: ${links.map((l) => l.split("/")[1]).join(",") || "-"}`,
				`card: ${count(segment, /data-testid="card\.wrapper"/g)}`,
				`tco: ${unique(segment.match(/https:\/\/t\.co\/[A-Za-z0-9]+/g) ?? []).join(",") || "-"}`,
			].join(" | "),
		);
	});
}

// 指定 status ID の article から tweetText を取り出し、bookmarklet の
// extractText と同じ扱い（img の alt を拾う）で本文にする
function text(html, statusId) {
	if (!statusId) {
		console.error("text コマンドには statusId が必要です");
		process.exit(1);
	}
	const segment = splitArticles(html).find((s) =>
		s.includes(`/status/${statusId}`),
	);
	if (!segment) {
		console.error(`status ID ${statusId} を含む article がありません`);
		process.exit(1);
	}
	const index = segment.indexOf('data-testid="tweetText"');
	if (index === -1) {
		console.error("article 内に tweetText がありません");
		process.exit(1);
	}
	console.log(plainText(elementHtmlAt(segment, index)));
}

// 特定の文字列が DOM のどこに出るかを前後の文脈つきで見る
function grep(html, word, context = "120") {
	if (!word) {
		console.error("grep コマンドには word が必要です");
		process.exit(1);
	}
	const width = Number(context);
	const hits = [];
	let index = html.indexOf(word);
	while (index !== -1) {
		hits.push(index);
		index = html.indexOf(word, index + 1);
	}
	for (const hit of hits.slice(0, 50)) {
		const from = Math.max(0, hit - width);
		console.log(
			hit,
			JSON.stringify(html.slice(from, hit + word.length + width)),
		);
	}
	console.log(
		`${hits.length} hits${hits.length > 50 ? "（先頭 50 件のみ表示）" : ""}`,
	);
}

// 引用ツイートを除けば article は入れ子にならないので、開始タグで切るだけで
// ツイート単位に分かれる
function splitArticles(html) {
	return html.split("<article").slice(1);
}

// 属性の位置から、その要素の開始タグと対応する終了タグまでを切り出す
function elementHtmlAt(html, attrIndex) {
	const open = html.lastIndexOf("<", attrIndex);
	const tag = html.slice(open + 1).match(/^[a-zA-Z0-9]+/)[0];
	const openEnd = html.indexOf(">", attrIndex) + 1;
	const boundary = new RegExp(`</?${tag}\\b`, "gi");
	boundary.lastIndex = openEnd;
	let depth = 1;
	let match = boundary.exec(html);
	while (match !== null) {
		depth += match[0][1] === "/" ? -1 : 1;
		if (depth === 0) {
			return html.slice(open, html.indexOf(">", match.index) + 1);
		}
		match = boundary.exec(html);
	}
	return html.slice(open);
}

function plainText(fragment) {
	return decodeEntities(
		fragment
			// 絵文字は img の alt に入っており、タグを落とすだけでは消える
			.replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/gi, "$1")
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<[^>]+>/g, ""),
	);
}

function decodeEntities(s) {
	const table = {
		amp: "&",
		lt: "<",
		gt: ">",
		quot: '"',
		"#39": "'",
		nbsp: " ",
	};
	return s.replace(/&(#?\w+);/g, (whole, name) => table[name] ?? whole);
}

function count(s, pattern) {
	return (s.match(pattern) ?? []).length;
}

function unique(values) {
	return [...new Set(values)];
}
