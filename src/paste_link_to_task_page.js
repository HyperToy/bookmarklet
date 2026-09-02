(() => {
	// external data
	const PROJECT_NAME = "placeholder";
	const NAME = "placeholder";
	const now = new Date();
	const domain = window.location.hostname;
	const url = window.location.href;
	const documentTitle = document.title;
	const documentUrl = document.URL;

	// pure functions
	const cond = (cases, fallback) => (x) => {
		const found = cases.find(([test]) => test(x));
		return (found ? found[1] : fallback)();
	};
	const isScrapboxDomain = (d) => d.toLowerCase().endsWith("scrapbox.io");
	const isTwitterDomain = (d) => {
		const h = d.toLowerCase();
		return h === "x.com" || h.endsWith(".x.com");
	};
	const isYoutubeDomain = (d) => {
		const h = d.toLowerCase();
		return ["youtube.com", "youtu.be"].some(
			(x) => h === x || h.endsWith(`.${x}`),
		);
	};
	const scrapboxUrl = (pn, dt, du) => {
		const regexp = /(.*) - .*/;
		const match = dt.match(regexp);
		const pageTitle = match[1];
		const projectName = du.split("/")[3];
		return projectName === pn
			? `[${pageTitle}]`
			: `[/${projectName}/${pageTitle}]`;
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
	const thisWeekTaskPage = (name, now) => {
		const thisMonday = new Date(now).setDate(now.getDate() - now.getDay() + 1);
		const formattedThisMonday = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Tokyo",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(thisMonday);
		const pageTitle = `${name}'s Task ${formattedThisMonday}週`;
		return pageTitle;
	};
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

	console.log("[bookmarklet] domain:", domain);
	// X / YouTube は Twitter yyyy-mm-dd / YouTube yyyy-mm-dd 側の取り込み先が決まっているので、
	// 会社アカウントの Task ページへ送ってしまう誤爆を防ぐ
	if (isTwitterDomain(domain) || isYoutubeDomain(domain)) {
		console.warn(
			"[bookmarklet] X / YouTube はこの bookmarklet の対象外のため、何もしませんでした:",
			url,
		);
		showMessage("X / YouTube はこの bookmarklet の対象外です", "red", 3000);
		return;
	}

	const title = documentTitle
		.replaceAll("[", "")
		.replaceAll("]", "")
		.replaceAll("`", " ");
	const body = encodeURIComponent(
		cond(
			[
				[
					isScrapboxDomain,
					() => scrapboxUrl(PROJECT_NAME, documentTitle, documentUrl),
				],
				[isImslpDomain, () => imslpUrl(title, documentUrl)],
				[isYodobashiDomain, () => yodobashiUrl(title, documentUrl)],
				[isFindyDomain, () => findyUrl(title, documentUrl)],
			],
			() => `[${title} ${url}]`,
		)(domain),
	);

	const pageTitle = thisWeekTaskPage(NAME, now);
	const cosenseUrl = `https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(pageTitle.trim())}?body=${body}`;
	console.log("[bookmarklet] 送り先:", pageTitle);
	console.log("[bookmarklet] URL:", cosenseUrl);
	window.open(cosenseUrl);
})();
