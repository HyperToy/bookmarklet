(() => {
	const projectName = "PROJECT_NAME";
	const name = "NAME";
	const now = new Date();
	const thisMonday = new Date(now).setDate(now.getDate() - now.getDay() + 1);
	const formattedThisMonday = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(thisMonday);
	const url = `https://scrapbox.io/${projectName}/${name}'s Task ${formattedThisMonday}週`;
	window.location.href = url;
})();
