import restart from "../public/restart.svg";
import van from "vanjs-core";
import "./App.css";
import { SilentStitch } from "./utils/StitchTypes";
import { parseStitch } from "./utils/StitchParser";
import Banner from "./components/Banner";
import StitchDisplay from "./components/StitchDisplay";
import { UserState } from "./utils/UserState";
import ClampedState from "./utils/ClampedState";
import Fraction from "./components/Fraction";

export const App = () => {
	const { div, button, input, img } = van.tags;

	const isNarrow = van.state(window.innerWidth < 710)
	window.addEventListener("resize", () => {
		isNarrow.val = window.innerWidth < 710
	})

	const stitches = van.state(new SilentStitch());
	const row_input = van.state("");
	const index = ClampedState(0, 0, van.derive(() => stitches.val.length));
	van.derive(() => { stitches.val = parseStitch(row_input.val); index.val = 0; });
	const userstate = localStorage.getItem("userstate");
	if (userstate) {
		try {
			const userobj = JSON.parse(userstate) as UserState;
			console.log("loaded", userobj);
			row_input.val = userobj.rowStr;
			setTimeout(() => index.val = userobj.index, 0);
		} catch (err) { }
	}

	let last_timeout = 0;
	van.derive(() => {
		const state = new UserState(row_input.val, index.val);
		clearTimeout(last_timeout);
		last_timeout = setTimeout(() => {
			localStorage.setItem("userstate", JSON.stringify(state));
		}
			, 100);
	});
	const forward_button = button({ class: "pad-btn", onclick: () => index.val++ }, "+");
	van.derive(() => { index.val; forward_button.focus() })
	return [
		input({
			class: "full-width card", onkeydown: evt => {
				if (evt.key === "Enter") {
					row_input.val = evt.target.value
					forward_button.focus();
					evt.preventDefault();
				}
			},
			type: "text",
			value: row_input.val,
			placeholder: "Enter row notation here...",
		}),
		div({ class: "row-display" }, () => stitches.val.toString()),
		div({ class: "vert-spacer" }),
		StitchDisplay(stitches, index),
		() => isNarrow.val ?
			Banner(
				button({ class: "small pad-btn", onclick: () => { index.val--; forward_button.focus() } }, "-"),
				forward_button,
				button({ class: "small", onclick: () => { index.val = 0; forward_button.focus() } }, img({ src: restart })),
			)
			:
			Banner(
				Fraction(index, van.derive(() => stitches.val.length)),
				div({ class: "hor-spacer" }),
				button({ class: "small pad-btn", onclick: () => { index.val--; forward_button.focus() } }, "-"),
				forward_button,
				button({ class: "small", onclick: () => { index.val = 0; forward_button.focus() } }, img({ src: restart })),
				div({ class: "hor-spacer" }),
				Fraction(index, van.derive(() => stitches.val.length)),
			),
		() => isNarrow.val ?
			Banner(
				Fraction(index, van.derive(() => stitches.val.length)),
				div({ class: "hor-spacer" }),
				Fraction(index, van.derive(() => stitches.val.length)),
			)
			:
			div(),
	];
};

const root = document.getElementById("app") as HTMLElement;

van.add(root, App());
