(() => {
	const today = new Date();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	const formattedDate = month + day;
	const url = `https://twilog.togetter.com/user_name/date-${formattedDate}`;
	window.location.href = url;
})();
