import van from "vanjs-core";
import "./App.css";
import { SilentStitch } from "./utils/StitchTypes";
import { parseStitch } from "./utils/StitchParser";
import Banner from "./components/Banner";
import StitchDisplay from "./components/StitchDisplay";
import { UserState } from "./utils/UserState";
import ClampedState from "./utils/ClampedState";

export const App = () => {
	const { div, button, input } = van.tags;
	const stitches = van.state(new SilentStitch());
	const row_input = van.state("");
	van.derive(() => stitches.val = parseStitch(row_input.val));
	const index = ClampedState(0, 0, van.derive(() => stitches.val.length));
	const userstate = localStorage.getItem("userstate");
	if (userstate) {
		try {
			const userobj = JSON.parse(userstate) as UserState;
			console.log("loaded", userobj);
			row_input.val = userobj.rowStr;
			setTimeout(() => index.val = userobj.index, 0);
		} catch (err) { }
	}

	van.derive(() => {
		console.log("saving");
		localStorage.setItem("userstate", JSON.stringify(new UserState(row_input.val, index.val)));
	});
	return [
		input({ class: "full-width card", value: row_input.val, placeholder: "Enter row notation here...", oninput: e => row_input.val = e.target.value }),
		div(() => stitches.val.toString()),
		div({ class: "vert-spacer" }),
		Banner(StitchDisplay(stitches, index)),
		Banner(button({ style: "font-size: 0.75rem;", onclick: () => index.val-- }, "-"), button({ onclick: () => index.val++ }, "+")),
	];
};

const root = document.getElementById("app") as HTMLElement;

van.add(root, App());
