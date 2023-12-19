
import { antiCORS, buttonStyle, save, load, pocketItem, colors } from "./commons";
import { buildElement } from "./domkraft";
main();

async function main(){
	const filebox = document.querySelector("#fileUpload") as HTMLInputElement;
	const sourcebox = document.querySelector("input[name=source]") as HTMLInputElement;
	if (!filebox || !sourcebox) return;

	const textbox = buildElement({
		elementName: "input",
		attributes: {
			type: "text",
			placeholder: "Upload from URL"
		},
		className: "tag-list-search",
		events: {
			input: async (e, el) => {
				e.preventDefault();
				const v = el.value;
				if (!v.startsWith("http")) return;
		
				const imageResponse = await fetch(antiCORS(v));
				const imgBlob = await imageResponse.blob();
				const file = new File([imgBlob], "pasted_image.png", { type: imgBlob.type });
		
				const dt = new DataTransfer();
				dt.items.add(file);
				filebox.files = dt.files;
				//filebox.files[0] = file;
				filebox.dispatchEvent(new Event("change"));
			}
		}
	});

	filebox.after(textbox);

	const pocket = await load("pocket");
	const prefs = await load("prefs");
	const remover = async (el: HTMLElement, links: string[]) => {
		el.parentElement?.parentElement?.parentElement?.remove();
		const index = pocket.findIndex(item => item === links);
		if (index >= 0){
			pocket.splice(index, 1);
			await save("pocket", pocket);
		}
	};
	const pocketBox = buildElement({
		elementName: "details",
		style: {
			marginBottom: "1em"
		},
		children: [
			buildElement({
				// Pocket Button
				elementName: "summary",
				textContent: `Fill from pocket (${pocket.length})`,
				style: {
					...buttonStyle(),
					listStyle: "none",
					width: "fit-content",
				}
			}),
			buildElement({
				// Pocket Contents
				style: {
					marginTop: "1em",
					width: "100%",
					maxHeight: "40vh",
					padding: "1em",
					gap: "1em",
					overflow: "auto",
					display: "flex",
					flexFlow: "column nowrap",
					alignItems: "start",
					justifyContent: "start",
					border: "1px solid #f0f0f0",
					borderRadius: ".2em",
					boxSizing: "border-box"
				},
				children: pocket.length === 0 ? [
					buildElement({
						style: {
							alignSelf: "center",
							justifySelf: "center"
						},
						textContent: "No posts saved to the pocket"
					})
				] : pocket.map(links => {
					const [source, original] = links;
					return pocketItem(
						links,
						[
							["Fill in", colors.gelbooru, (el) => {
								fillIn(textbox, sourcebox, original, source);
								if (prefs.removeOnFill){
									remover(el, links);
								}
							}],
							["Remove", colors.red, el => remover(el, links)]
						]
					);
				})
			})
		]
	});
	filebox.parentElement?.before(pocketBox);
};

function fillIn(contentbox: HTMLInputElement, sourcebox: HTMLInputElement, content: string, source: string){
	if (sourcebox) sourcebox.value = source;
	contentbox.value = content;
	contentbox.dispatchEvent(new Event("input"));
}
