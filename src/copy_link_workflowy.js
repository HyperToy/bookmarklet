(() => {
	const textToCopy = `<?xml version="1.0"?><opml version="2.0"><head></head><body><outline text="&lt;a href=&quot;${window.location.href}&quot;&gt;${document.title}&lt;/a&gt;"></outline></body></opml>`;
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
