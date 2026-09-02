(() => {
	const domain = window.location.hostname;
	const url = window.location.href;
	const documentTitle = document.title;
	const documentUrl = document.URL;
	const cond = (cases, fallback) => (x) => {
		const found = cases.find(([test]) => test(x));
		return (found ? found[1] : fallback)();
	};
	const isScrapboxDomain = (d) => d.toLowerCase().endsWith("scrapbox.io");
	const isTwitterDomain = (d) => {
		const h = d.toLowerCase();
		return h === "x.com" || h.endsWith(".x.com");
	};
	const twitterText = (defaultText, dt, du) => {
		const userMatch = du.match(/x\.com\/([^/]*)/);
		if (!userMatch) {
			console.warn(
				"[bookmarklet] URL からユーザー名を取得できませんでした:",
				du,
			);
			showMessage("ツイートのユーザー名を取得できませんでした", "red", 3000);
			return defaultText;
		}
		const body = tweetBody(du);
		if (body !== null) {
			return twitterQuote(userMatch[1], du, body);
		}
		const titleBody = titleTweetBody(dt);
		if (titleBody !== null) {
			console.warn(
				"[bookmarklet] tweetText を DOM から取得できず、document.title から抽出しました。改行は失われます。",
			);
			showMessage(
				"本文を title から抽出しました（改行は失われます）",
				"black",
				3000,
			);
			return twitterQuote(userMatch[1], du, titleBody);
		}
		console.warn(
			"[bookmarklet] tweetText も document.title も抽出できず、通常のリンクにフォールバックしました。",
		);
		showMessage("ツイート本文を取得できませんでした", "red", 3000);
		return defaultText;
	};
	const twitterQuote = (user, du, body) => {
		const lines = body
			.split("\n")
			.map((line) => (line === "" ? " >" : ` > ${line}`));
		return [`> [@${user} ${du}]:`, ...lines].join("\n");
	};
	const tweetBody = (du) => {
		const idMatch = du.match(/\/status\/(\d+)/);
		if (!idMatch) {
			console.warn(
				"[bookmarklet] URL から status ID を取得できませんでした:",
				du,
			);
			return null;
		}
		const statusId = idMatch[1];
		const articles = [...document.querySelectorAll("article")];
		const article = articles.find((a) =>
			a.querySelector(`a[href*="/status/${statusId}"]`),
		);
		console.log(
			"[bookmarklet] status ID:",
			statusId,
			"/ article 数:",
			articles.length,
			"/ 特定:",
			Boolean(article),
		);
		if (!article) {
			console.warn(
				"[bookmarklet] status ID に対応する article が見つかりませんでした",
			);
			return null;
		}
		const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
		if (!tweetTextElement) {
			console.warn(
				"[bookmarklet] article 内に tweetText がありません（本文なしの投稿の可能性）",
			);
			return null;
		}
		const body = stripLoneSurrogates(extractText(tweetTextElement));
		console.log("[bookmarklet] DOM から抽出した本文:\n", body);
		const cardUrl = cardLinkUrl(article, tweetTextElement);
		if (cardUrl === null) {
			return body;
		}
		return body === "" ? cardUrl : `${body}\n${cardUrl}`;
	};
	// 末尾の URL はカード表示に置き換えられて tweetText から消える。元 URL は DOM のどこにも
	// 残っていないので t.co で補い、後で人間が張り替える。
	const cardLinkUrl = (article, tweetTextElement) => {
		const card = article.querySelector('[data-testid="card.wrapper"]');
		if (!card) {
			return null;
		}
		const link = card.querySelector('a[href^="https://t.co/"]');
		if (!link) {
			console.log(
				"[bookmarklet] カードはありますが t.co リンクがありません（投票などの可能性）",
			);
			return null;
		}
		if (tweetTextElement.querySelector(`a[href="${link.href}"]`)) {
			console.log(
				"[bookmarklet] カードのリンクは本文にも含まれているため追加しません:",
				link.href,
			);
			return null;
		}
		console.warn(
			"[bookmarklet] カードの t.co リンクを本文末尾に追加しました。元 URL は DOM に無いため手動で張り替えてください:",
			link.href,
		);
		showMessage("カードの URL は t.co のままです", "black", 3000);
		return link.href;
	};
	const extractText = (node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.nodeValue;
		}
		if (node.nodeType !== Node.ELEMENT_NODE) {
			return "";
		}
		const tag = node.tagName.toLowerCase();
		if (tag === "img") {
			// 絵文字は img の alt に入っており、textContent では落ちる
			return node.alt;
		}
		if (tag === "br") {
			return "\n";
		}
		if (tag === "a") {
			// 完全な URL が aria-hidden の span に分割されて入っている。末尾の … だけ落とす
			return node.textContent.replace(/…$/, "");
		}
		return [...node.childNodes].map(extractText).join("");
	};
	// encodeURIComponent は孤立サロゲートで URIError を投げるため、DOM 由来の文字列から取り除く
	const stripLoneSurrogates = (s) =>
		Array.from(s)
			.filter((c) => {
				const code = c.charCodeAt(0);
				return c.length > 1 || code < 0xd800 || code > 0xdfff;
			})
			.join("");
	const titleTweetBody = (dt) => {
		const match = dt.match(/さん: 「([\s\S]*)」 \/ X/);
		return match ? match[1] : null;
	};
	const isYoutubeDomain = (d) => {
		const h = d.toLowerCase();
		return ["youtube.com", "youtu.be"].some(
			(x) => h === x || h.endsWith(`.${x}`),
		);
	};
	const youtubeText = (t, u) => {
		const videoId = youtubeVideoId(u);
		if (!videoId) {
			console.log("[bookmarklet] YouTube の動画ページではありません:", u);
			return `[${t} ${u}]`;
		}
		const start = new URL(u).searchParams.get("t");
		const videoUrl = `https://www.youtube.com/watch?v=${videoId}${start ? `&t=${start}` : ""}`;
		console.log("[bookmarklet] YouTube 動画 ID:", videoId, "/ URL:", videoUrl);
		return [`[${t} ${videoUrl}]`, ` [${videoUrl}]`].join("\n");
	};
	const youtubeVideoId = (u) => {
		const parsed = new URL(u);
		const v = parsed.searchParams.get("v");
		if (v) {
			return v;
		}
		const embedded = parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
		if (embedded) {
			return embedded[1];
		}
		if (parsed.hostname.toLowerCase().endsWith("youtu.be")) {
			const short = parsed.pathname.match(/^\/([^/]+)/);
			return short ? short[1] : null;
		}
		return null;
	};
	const isImslpDomain = (d) => d.toLowerCase().endsWith("imslp.org");
	const imslpUrl = (dt, du) =>
		`[${dt.replace(/(.* - IMSLP)\/ペトルッチ楽譜ライブラリー: パブリックドメインの無料楽譜/, "$1")} ${du}]`;
	const isYodobashiDomain = (d) => d.toLowerCase().endsWith("yodobashi.com");
	const yodobashiUrl = (dt, du) =>
		`[${dt.replace(/ヨドバシ\.com - (.*) 通販【全品無料配達】/, "$1 - yodobashi")} ${du}]`;
	const isFindyDomain = (d) => d.toLowerCase().endsWith("findy-code.io");
	const findyUrl = (dt, du) =>
		`[${dt.replace(/(.*) \| IT\/Webエンジニアの転職・求人サイトFindy – GitHubからスキル偏差値を算出/, "$1 - Findy")} ${du}]`;
	const showMessage = (text, backgroundColor, ms) => {
		const message = document.createElement("div");
		message.style.position = "fixed";
		message.style.bottom = "10px";
		message.style.right = "10px";
		message.style.padding = "10px";
		message.style.backgroundColor = backgroundColor;
		message.style.color = "white";
		message.style.zIndex = 10000;
		message.textContent = text;
		document.body.appendChild(message);
		setTimeout(() => {
			document.body.removeChild(message);
		}, ms);
	};

	const title = documentTitle
		.replaceAll("[", "")
		.replaceAll("]", "")
		.replaceAll("`", " ");
	const textToCopy = cond(
		[
			[isScrapboxDomain, () => `${url}`],
			[
				isTwitterDomain,
				() => twitterText(`[${title} ${url}]`, documentTitle, documentUrl),
			],
			[isYoutubeDomain, () => youtubeText(title, url)],
			[isImslpDomain, () => imslpUrl(title, documentUrl)],
			[isYodobashiDomain, () => yodobashiUrl(title, documentUrl)],
			[isFindyDomain, () => findyUrl(title, documentUrl)],
		],
		() => `[${title} ${url}]`,
	)(domain);
	console.log("[bookmarklet] domain:", domain);
	console.log("[bookmarklet] コピーする内容:\n", textToCopy);
	navigator.clipboard.writeText(textToCopy).then(
		() => {
			showMessage("Title and URL copied to clipboard", "black", 500);
		},
		(err) => {
			console.error(
				"[bookmarklet] クリップボードへのコピーに失敗しました:",
				err,
			);
			showMessage(`Could not copy text: ${err}`, "red", 500);
		},
	);
})();
