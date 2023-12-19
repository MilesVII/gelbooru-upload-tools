import { buttonStyle, pocketItem, colors, save, load } from "./commons";
import type { Storage } from "./commons";
import { buildElement } from "./domkraft";

const rofBox = document.querySelector("#rof") as HTMLInputElement;

function controlsButton(caption: string, color: string, cb: (event: Event, element: HTMLElement) => void){
	return buildElement({
		style: {
			...buttonStyle(color)
		},
		textContent: caption,
		events: {
			click: cb,

		}
	});
}

function renderItems(pocket: Storage["pocket"]){
	return (pocket.map(links => pocketItem(
		links,
		[
			["Remove", colors.red, async (el) => {
				el.parentElement?.parentElement?.parentElement?.remove();
				const index = pocket.findIndex(item => item === links);
				if (index >= 0){
					pocket.splice(index, 1);
					await save("pocket", pocket);
				}
			}]
		]
	)));
}

async function main(){
	const [prefs, pocket] = await Promise.all([load("prefs"), load("pocket")]);

	rofBox.checked = prefs.removeOnFill;
	rofBox.addEventListener("change", e => {
		prefs.removeOnFill = rofBox.checked;
		console.log(prefs);
		save("prefs", prefs);
	});

	const listBox = document.querySelector(".list") as HTMLElement;
	const controls = buildElement({
		className: "row",
		children: [
			controlsButton("Remove all", colors.red, () => {
				document.querySelectorAll(".pocket-item").forEach(i => i.remove());
				save("pocket", []);
			}),
			controlsButton("Reload", colors.gelbooru, async () => {
				const pocket = await load("pocket");
				document.querySelectorAll(".pocket-item").forEach(i => i.remove());
				listBox.append(...renderItems(pocket));
			})
		]
	});
	listBox.append(controls, ...renderItems(pocket));
}
main();