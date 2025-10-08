import van, { State } from "vanjs-core";

const Editor = (content: State<string[]>) => {
	const { div, textarea } = van.tags;
	return div({ class: "editor card" },
		() => div({ class: "line-numbers", innerHTML: content.val.map((_, idx) => (idx + 1).toString()).join("<br>") }),
		textarea({
			class: "editor-area", value: content.rawVal.join("\n"), oninput: e => {
				const me = e.target;
				content.val = me.value.split("\n");
				me.style.height = `calc(${content.rawVal.length}em + 2px)`;
			}
		})
	);
};
export default Editor;
