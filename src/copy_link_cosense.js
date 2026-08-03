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
	const isTwitterDomain = (d) => d.toLowerCase().endsWith("x.com");
	const twitterUrl = (defaultText, dt, du) => {
		try {
			return [
				">",
				`[@${du.match(/x.com\/([^\/]*)/)[1]} ${du}]:`,
				dt.match(/さん: 「(.*)」 \/ X/)[1],
			].join(" ");
		} catch (e) {
			return defaultText;
		}
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

	const title = documentTitle
		.replaceAll("[", "")
		.replaceAll("]", "")
		.replaceAll("`", " ");
	const textToCopy = cond(
		[
			[isScrapboxDomain, () => `${url}`],
			[
				isTwitterDomain,
				() => twitterUrl(`[${title} ${url}]`, documentTitle, documentUrl),
			],
			[isImslpDomain, () => imslpUrl(title, documentUrl)],
			[isYodobashiDomain, () => yodobashiUrl(title, documentUrl)],
			[isFindyDomain, () => findyUrl(title, documentUrl)],
		],
		() => `[${title} ${url}]`,
	)(domain);
	navigator.clipboard.writeText(textToCopy).then(
		(data) => {
			const message = document.createElement("div");
			message.style.position = "fixed";
			message.style.bottom = "10px";
			message.style.right = "10px";
			message.style.padding = "10px";
			message.style.backgroundColor = "black";
			message.style.color = "white";
			message.style.zIndex = 10000;
			message.textContent = "Title and URL copied to clipboard";
			document.body.appendChild(message);
			setTimeout(() => {
				document.body.removeChild(message);
			}, 500);
		},
		(err) => {
			const errorMessage = document.createElement("div");
			errorMessage.style.position = "fixed";
			errorMessage.style.bottom = "10px";
			errorMessage.style.right = "10px";
			errorMessage.style.padding = "10px";
			errorMessage.style.backgroundColor = "red";
			errorMessage.style.color = "white";
			errorMessage.style.zIndex = 10000;
			errorMessage.textContent = `Could not copy text: ${err}`;
			document.body.appendChild(errorMessage);
			setTimeout(() => {
				document.body.removeChild(errorMessage);
			}, 500);
		},
	);
})();
