import restart from "/restart.svg";
import share from "/share.svg";
import notepad from "/notepad.svg";
import van from "vanjs-core";
import "./App.css";
import { SilentStitch } from "./utils/StitchTypes";
import { parseStitch } from "./utils/StitchParser";
import Banner from "./components/Banner";
import StitchDisplay from "./components/StitchDisplay";
import { UserState } from "./utils/UserState";
import ClampedState from "./utils/ClampedState";
import Fraction from "./components/Fraction";
import Editor from "./components/Editor";
import Toast from "./components/Toast";

const root = document.getElementById("app") as HTMLElement;

export const App = () => {
	const { div, button, input, img } = van.tags;

	const isNarrow = van.state(window.innerWidth < 710)
	window.addEventListener("resize", () => {
		isNarrow.val = window.innerWidth < 710
	})

	const title = van.state("");
	const editor_is_open = van.state(false);
	const stitches = van.state(new SilentStitch());
	const all_rows = van.state([""]);
	const row_index = ClampedState(0, 0, van.derive(() => all_rows.val.length));
	const curr_row_val = van.derive(() => all_rows.val[row_index.val] ?? "");
	const stitch_index = ClampedState(0, -1, van.derive(() => stitches.val.length));
	van.derive(() => { stitches.val = parseStitch(curr_row_val.val); stitch_index.val = 0; });

	let last_timeout = 0;
	let state = new UserState(all_rows.rawVal, stitch_index.rawVal, row_index.rawVal, title.rawVal);

	const setFromState = (state: UserState) => {
		title.val = state.title;
		all_rows.val = state.rows;
		Promise.resolve().then(() => {
			row_index.val = state.row_index;
			Promise.resolve().then(() => {
				stitch_index.val = state.stitch_index;
			});
		});
	};

	const search = new URLSearchParams(location.search);
	let isValidSearchParams = false;
	const newState = new UserState([], 0, 0, "");
	for (const key of Object.keys(state)) {
		const val = search.get(key);
		if (val) {
			isValidSearchParams = true;
			newState[key] = val;
		}
	}
	if (isValidSearchParams) {
		van.add(root, Toast("Loaded pattern from URL"));
		const url = new URL(location.href);
		url.search = "";
		history.replaceState(null, "", url.toString());
		newState.rows = (newState.rows + "").split("\n");
		setFromState(newState);
	}
	else {
		const userstate = localStorage.getItem("userstate");
		if (userstate) {
			try {
				const userobj = JSON.parse(userstate) as UserState;
				setFromState(userobj);
			} catch (err) { }
		}
	}
	const share_img = van.state(share);
	const share_button = button({ style: "height: 50%", onclick: share_button_onclick }, img({ style: "width: 100%; height: 100%", src: () => share_img.val }));
	function share_button_onclick() {
		van.add(root, Toast("Copied to clipboard"));
		const url = new URL(window.location.href);
		url.searchParams.set("stitch_index", state.stitch_index + "");
		url.searchParams.set("row_index", state.row_index + "");
		url.searchParams.set("rows", state.rows.join("\n"));
		url.searchParams.set("title", state.title);
		navigator.clipboard.writeText(url.toString());
	}
	const forward_button = button({
		class: "pad-btn middle", onclick: () => {
			if (stitch_index.val === stitches.val.length) {
				stitch_index.val = 0;
				row_index.val++;
			}
			else {
				stitch_index.val++
			}
		}
	}, "+");
	document.onkeydown = evt => {
		if (evt.key === "Escape") {
			editor_is_open.val = false;
			forward_button.focus();
			evt.preventDefault();
		}
	}

	setTimeout(() => forward_button.focus(), 0);
	van.derive(() => {
		state = new UserState(all_rows.val, stitch_index.val, row_index.val, title.val);
		clearTimeout(last_timeout);
		last_timeout = setTimeout(() => {
			const json = JSON.stringify(state);
			localStorage.setItem("userstate", json);
		}
			, 200);
	});

	const back = () => {
		if (stitch_index.val == -1 && row_index.rawVal > 0) {
			stitch_index.val = stitches.rawVal.length - 1;
			row_index.val--;
			setTimeout(() => stitch_index.val = stitches.rawVal.length - 1, 0);
		}
		else {
			stitch_index.val--;
		}
		forward_button.focus();
	};
	return [
		() => editor_is_open.val ? Editor(all_rows) : div({ style: "display: none" }),
		input({
			class: "card title", type: "text", placeholder: "Pattern Title", value: () => title.val, oninput: evt => title.val = evt.target.value
		}),
		div({ style: "display: flex; gap: 0.5rem;" },
			input({
				class: "full-width card",
				onkeydown: evt => {
					if (evt.key === "Enter") {
						forward_button.focus();
						evt.preventDefault();
					}
				},
				oninput: evt => {
					const new_rows = all_rows.val;
					new_rows[row_index.val] = evt.target.value;
					all_rows.val = [...new_rows];
				},
				type: "text",
				value: () => curr_row_val.val,
				placeholder: "Enter row notation here...",
			}),
			button({ class: () => editor_is_open.val ? "notepad-open" : "", style: "z-index: 5;", onclick: () => editor_is_open.val = !editor_is_open.val }, img({ src: notepad })),
			share_button,
		),
		div({ class: "row-display" }, () => stitches.val.toString()),
		div({ class: "vert-spacer" }),
		StitchDisplay(stitches, stitch_index),
		() => isNarrow.val ?
			Banner(
				button({ class: "pad-btn left", onclick: back }, "-"),
				forward_button,
				button({ class: "right", onclick: () => { row_index.val = 0; Promise.resolve().then(() => stitch_index.val = 0); forward_button.focus() } }, img({ src: restart })),
			)
			:
			Banner(
				Fraction(stitch_index, van.derive(() => stitches.val.length)),
				div({ class: "hor-spacer" }),
				button({ class: "pad-btn left", onclick: back }, "-"),
				forward_button,
				button({ class: "right", onclick: () => { row_index.val = 0; Promise.resolve().then(() => stitch_index.val = 0); forward_button.focus() } }, img({ src: restart })),
				div({ class: "hor-spacer" }),
				Fraction(row_index, van.derive(() => all_rows.val.length)),
			),
		() => isNarrow.val ?
			Banner(
				Fraction(stitch_index, van.derive(() => stitches.val.length)),
				div({ class: "hor-spacer" }),
				Fraction(row_index, van.derive(() => all_rows.val.length)),
			)
			:
			div(),
	];
};


van.add(root, App());
