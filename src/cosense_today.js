(() => {
	const userName = "COSENSE_USERNAME";
	const now = new Date();
	const formattedDate = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
	const url = `https://scrapbox.io/${userName}/${formattedDate}`;
	window.location.href = url;
})();
