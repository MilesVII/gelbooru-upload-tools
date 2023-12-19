
import { save, load } from "./commons";
import { buildElement } from "./domkraft";

const caption = {
	start: "▶",
	startHollow: "▷",
	stop: "▢",
	stopHollow: "▢"
};
const colors = {
	black: "black",
	white: "white",
	active: "cornflowerblue"
};
let running = false;
let halt = false;
const [setButtonCaption, setButtonColor] = addButton();
setButtonCaption(getStateCaption());
const [setToastCaption, setToastShow] = addToast();

function flickerToast(caption: string, time = 5000) {
	setToastCaption(caption);
	setToastShow(true);
	setTimeout(() => setToastShow(false), time);
}

function sleep(ms: number){return new Promise(resolve => setTimeout(resolve, ms));}

function nextArticle(article: HTMLElement){
	const list = Array.from(document.querySelectorAll("section img"));
	const index = list.findIndex(i => i === article);
	if (index === list.length - 1) return null;
	return list[index + 1] as HTMLElement;
}

function source(article: HTMLElement){
	let scope = article.parentElement;
	while (true) {
		if (scope === null) return null;
		if (scope === document.body) return null;
		if (scope.nodeName === "A") return (scope as HTMLAnchorElement).href;
		scope = scope.parentElement;
	}
}

function pic(article: HTMLImageElement){
	const regexMatch = article.src.match(/\?format=(.*)[&$]/);
	const format = regexMatch ? regexMatch[1] : "jpg";
	return [`${article.src.split("?")[0]}.${format}:orig`, article.src];
}

function addButton(): [([captionText, leftpad]: [string, number]) => void, (color: string) => void]{
	const button = buildElement({
		style: {
			backgroundColor: colors.white,
			borderRadius: "50%",
			width: "5vw",
			height: "5vw",
			cursor: "pointer",
			position: "fixed",
			top: "2vw",
			right: "2vw",
			zIndex: "1000",
			boxShadow: "3px 3px 3px rgba(0, 0, 0, .7)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			transition: "background-color .42s ease-in-out"
		},
		children: [
			buildElement({
				style: {
					fontSize: "2vw",
					color: colors.black
				}
			})
		]
	});
	
	const caption = button.children[0] as HTMLElement;

	function updateCaption([captionText, leftpad]: [string, number]){
		caption.textContent = captionText
		const w = parseFloat(getComputedStyle(caption).width);
		const rw = w / window.innerWidth * 100;
		caption.style.transform = `translateX(${rw * leftpad}vw)`;
	}

	button.addEventListener("click", () => {
		if (running){
			halt = true;
			updateCaption(getStateCaption());
		} else
			fenchb();
	});

	document.body.append(button);

	return [
		updateCaption,
		(color: string) => button.style.backgroundColor = color
	];
}

function addToast(): [(caption: string) => void, (show: boolean) => void]{
	const toast = buildElement({
		style: {
			backgroundColor: colors.white,
			borderRadius: "2.5vw",
			fontSize: "2vw",
			fontFamily: `"TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
			color: colors.black,
			height: "5vw",
			padding: "0 2vw",
			cursor: "pointer",
			position: "fixed",
			bottom: "-5vw",
			right: "50%",
			transform: "translateX(50%)",
			zIndex: "1000",
			boxShadow: "3px 3px 3px rgba(0, 0, 0, .7)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			transition: "bottom .42s ease-in-out"
		},
		children: [
			buildElement({})
		],
		events: {
			click: (e, el) => el.style.bottom = "-5vw"
		}
	});

	document.body.append(toast);

	return [
		caption => toast.children[0].textContent = caption,
		show => toast.style.bottom = show ? "1vw" : "-5vw"
	];
}

function getStateCaption(): [string, number]{
	if (running) {
		if (halt)
			return [caption.stopHollow, 0];
		else
			return [caption.stop, 0];
	} else {
		if (true)
			return [caption.start, 1/6];
		else
			return [caption.startHollow, 1/6];
	}
}

async function fenchb(){
	if (running) return;
	running = true;
	setButtonCaption(getStateCaption());
	setButtonColor(colors.active);

	if (!window.location.href.endsWith("/media")){
		const tab = Array.from(document.querySelectorAll<HTMLElement>("[role=tab]"))
			.find(e => (e as HTMLAnchorElement)?.href.endsWith("/media"));
		if (tab)
			tab.click();
		else
			return;
		await sleep(3000);
	}

	const list: string[][] = [];
	let anchor: HTMLElement | null = null;
	while (!halt){
		if (anchor){
			anchor.scrollIntoView();
			await sleep(2000);
		}
		const targets = Array.from(document.querySelectorAll<HTMLImageElement>("section img"));
		if (anchor){
			const anchorIndex = targets.findIndex(t => t === anchor);
			if (anchorIndex !== -1)
				targets.splice(0, anchorIndex + 1);
		}
		if (targets.length === 0) break;
		const links = Array.from(targets).map(target => [source(target) ?? "", ...pic(target)]);
		list.push(...links);
		anchor = targets[targets.length - 1];
	}

	const storage = (await load("pocket")) ?? [];
	storage.push(...list);
	//window.localStorage.setItem("pocket", JSON.stringify(storage));
	await save("pocket", storage)
	flickerToast(`added ${list.length} posts to the pocket`);
	running = false;
	halt = false;
	setButtonCaption(getStateCaption());
	setButtonColor(colors.white);
}