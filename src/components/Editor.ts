import van, { State } from "vanjs-core";

const Editor = (content: State<string[]>) => {
	const { div, textarea } = van.tags;
	const updateHeight = e => {
		const me = e.target;
		content.val = me.value.split("\n");
		me.style.height = `calc(${content.rawVal.length}em + 2px)`;
	}

	const editor_area = textarea({
		class: "editor-area", value: content.rawVal.join("\n"), oninput: updateHeight
	})
	updateHeight({ target: editor_area });
	return div({ class: "editor card" },
		() => div({ class: "line-numbers", innerHTML: content.val.map((_, idx) => (idx + 1).toString()).join("<br>") }),
		editor_area
	);
};
export default Editor;
