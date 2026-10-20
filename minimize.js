import * as promises from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const srcDir = "src";
const outDir = "out";

async function cleanOutDir() {
	const files = await promises.readdir(outDir);
	await Promise.all(
		files
			.filter((file) => file.endsWith(".js"))
			.map((file) => promises.unlink(`${outDir}/${file}`)),
	);
}

async function copyFiles() {
	const files = await promises.readdir(srcDir);
	await Promise.all(
		files.map((file) =>
			promises.copyFile(`${srcDir}/${file}`, `${outDir}/${file}`),
		),
	);
}

async function minimizeJS() {
	await execAsync(`pnpm minimize-js ${outDir}`);
}

async function prependJavascript() {
	const files = await promises.readdir(outDir);
	await Promise.all(
		files
			.filter((file) => file.endsWith(".js"))
			.map(async (file) => {
				const filePath = `${outDir}/${file}`;
				const content = await promises.readFile(filePath, "utf-8");
				await promises.writeFile(
					filePath,
					`javascript:${encodeForUrl(content)}`,
				);
			}),
	);
}

// minimize-js は "\n" をリテラル改行入りのテンプレートリテラルに変換する。
// javascript: URL に登録すると改行が失われて空文字列になるため、percent-encode して残す。
// 元から含まれる %3A 等が二重解釈されないよう、% を先に escape する。
function encodeForUrl(code) {
	return code
		.replaceAll("%", "%25")
		.replaceAll("\n", "%0A")
		.replaceAll("\r", "%0D");
}

async function main() {
	try {
		await cleanOutDir();
		await copyFiles();
		await minimizeJS();
		await prependJavascript();
		console.log("Processing complete.");
	} catch (error) {
		console.error("Error:", error);
	}
}

main();
