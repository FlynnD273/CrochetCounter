import restart from "../public/restart.svg";
import notepad from "../public/notepad.svg";
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

export const App = () => {
	const { div, button, input, img } = van.tags;

	const isNarrow = van.state(window.innerWidth < 710)
	window.addEventListener("resize", () => {
		isNarrow.val = window.innerWidth < 710
	})

	const editor_is_open = van.state(false);
	const stitches = van.state(new SilentStitch());
	const all_rows = van.state([""]);
	const row_index = van.state(0);
	const curr_row_val = van.derive(() => all_rows.val[row_index.val]);
	const stitch_index = ClampedState(0, 0, van.derive(() => stitches.val.length));
	van.derive(() => { stitches.val = parseStitch(curr_row_val.val); stitch_index.val = 0; });
	const userstate = localStorage.getItem("userstate");
	if (userstate) {
		try {
			const userobj = JSON.parse(userstate) as UserState;
			if (Array.isArray(userobj.rows)) {
				all_rows.val = userobj.rows;
				setTimeout(() => { row_index.val = userobj.row_index; stitch_index.val = userobj.stitch_index; }, 0);
			}
		} catch (err) { }
	}

	let last_timeout = 0;
	van.derive(() => {
		const state = new UserState(all_rows.val, stitch_index.val, row_index.val);
		clearTimeout(last_timeout);
		last_timeout = setTimeout(() => {
			localStorage.setItem("userstate", JSON.stringify(state));
		}
			, 100);
	});
	const forward_button = button({
		class: "pad-btn", onclick: () => {
			if (stitch_index.val === stitches.val.length) {
				stitch_index.val = 0;
				row_index.val++;
			}
			else {
				stitch_index.val++
			}
		}
	}, "+");
	return [
		() => editor_is_open.val ? Editor(all_rows) : div(),
		div({ style: "display: flex" },
			input({
				class: "full-width card",
				onkeydown: evt => {
					if (evt.key === "Enter") {
						forward_button.focus();
						stitch_index.val = 0;
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
			button({ style: "z-index: 5;", onclick: () => editor_is_open.val = !editor_is_open.val }, img({ src: notepad })),
		),
		div({ class: "row-display" }, () => stitches.val.toString()),
		div({ class: "vert-spacer" }),
		StitchDisplay(stitches, stitch_index),
		() => isNarrow.val ?
			Banner(
				button({ class: "small pad-btn", onclick: () => { stitch_index.val--; forward_button.focus() } }, "-"),
				forward_button,
				button({ class: "small", onclick: () => { stitch_index.val = 0; forward_button.focus() } }, img({ src: restart })),
			)
			:
			Banner(
				Fraction(stitch_index, van.derive(() => stitches.val.length)),
				div({ class: "hor-spacer" }),
				button({ class: "small pad-btn", onclick: () => { stitch_index.val--; forward_button.focus() } }, "-"),
				forward_button,
				button({ class: "small", onclick: () => { stitch_index.val = 0; forward_button.focus() } }, img({ src: restart })),
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

const root = document.getElementById("app") as HTMLElement;

van.add(root, App());
