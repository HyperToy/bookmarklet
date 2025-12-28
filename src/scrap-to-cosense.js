(() => {
	const PROJECT_NAME = "YOUR_PROJECT_NAME";
	const title = window.prompt(
		`Scrap "${document.title}" to ${PROJECT_NAME}.`,
		document.title,
	);
	if (!title) {
		return;
	}
	let lines = ["", `[${window.location.href} ${document.title}]`];
	const quote = window.getSelection().toString();
	if (quote.trim()) {
		lines = lines.concat(quote.split(/\n/g).map((line) => ` > ${line}`));
	}
	lines.push("");
	const body = encodeURIComponent(lines.join("\n"));
	window.open(
		`https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(title.trim())}?body=${body}`,
	);
})();
