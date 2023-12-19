
import { buildElement } from "./domkraft";
import type { CSSProperties } from "./domkraft";
const browser = chrome;

type GenericObject = Record<string, any>;

export const colors = {
	gelbooru: "#0773fb",
	purple: "hsl(278.4, 96.9%, 50%)",
	red: "hsl(0, 96.9%, 50%)",
};

// export type PocketStorage = string[][];
// export type PrefsStorage = string[][];
export type Storage = {
	pocket: string[][],
	prefs: {
		removeOnFill: boolean
	}
};
type StorageKey = keyof Storage;
const defaults = {
	pocket: [],
	prefs: {
		removeOnFill: false
	}
};

export async function save<T extends StorageKey>(key: T, value: Storage[T]) {
	const payload: GenericObject = {};
	payload[key] = value;
	await browser.storage.local.set(payload);
}
export async function load<T extends StorageKey>(key: T): Promise<Storage[T]>{
	const stored = await browser.storage.local.get(key);
	if (stored && stored[key])
		return stored[key] as Storage[T];
	else
		return defaults[key] as Storage[T];
}

export function antiCORS(link: string){
	return `https://corsproxy.io/?${encodeURIComponent(link)}`;
}

export const buttonStyle: ((color?: string) => CSSProperties) = (color = colors.gelbooru) => ({
	backgroundColor: color,
	cursor: "pointer",
	borderRadius: ".2em",
	padding: ".5em",
	color: "white",
	fontWeight: "bold"
});

type ItemControl = [string, string, (el: HTMLElement) => void];
export function pocketItem(links: string[], controls: ItemControl[]){
	const [source, original, preview] = links;
	return buildElement({
		// Pocket Item
		style: {
			width: "100%",
			gap: "1em",
			padding: ".5em",
			display: "flex",
			alignItems: "center",
			justifyContent: "start",
			boxSizing: "border-box",
			fontWeight: "bold"
		},
		className: "pocket-item",
		children: [
			buildElement({
				// Item Preview
				elementName: "img",
				attributes: {
					src: preview ? antiCORS(preview) : "https://img3.gelbooru.com//images/b6/2e/b62e33410b2d3a43adf97ddd8e96769c.png"
				},
				style: {
					objectFit: "contain",
					width: "20%",
					maxHeight: "15em",
					//cursor: "pointer"
				}
				// events: {
				// 	click: () => fillIn(textbox, sourcebox, original, source)
				// }
			}),
			buildElement({
				// Item Contents
				style: {
					display: "flex",
					flexFlow: "column nowrap",
					gap: ".5em"
				},
				children: [
					...[source, original].map(link => buildElement({
						textContent: link,
						style: {
							cursor: "pointer"
						},
						events: {
							click: () => navigator.clipboard.writeText(link)
						}
					})),
					buildElement({
						// Item Controls
						style: {
							display: "flex",
							gap: "1em"
						},
						children: controls.map(([caption, color, cb]) => buildElement({
							style: {
								...buttonStyle(color ?? colors.gelbooru)
							},
							textContent: caption,
							events: {
								click: (e, el) => cb(el)
							}
						}))
					})
				]
			})
		]
	});
}