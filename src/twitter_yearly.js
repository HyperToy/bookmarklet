(() => {
	const username = "";
	const today = new Date();
	const tomorrow = new Date(today).setDate(today.getDate() + 1);
	const month = (today.getMonth() + 1).toString().padStart(2, "0");
	const month2 = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
	const day = today.getDate().toString().padStart(2, "0");
	const day2 = tomorrow.getDate().toString().padStart(2, "0");
	const queries = [];
	for (let year = today.getFullYear(); year >= 2015; year--) {
		const since = `${year}-${month}-${day}`;
		const until = `${year}-${month2}-${day2}`;
		queries.push(`(since%3A${since}%20until%3A${until})`);
	}
	const query = `from%3A${username}%20(${queries.join("%20OR%20")})`;
	const url = `https://x.com/search?q=${query}&src=typed_query&f=live`;
	window.open(url, "_blank");
})();
