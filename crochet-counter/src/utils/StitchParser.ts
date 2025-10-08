import { BaseStitch, RepeatStitch, SilentStitch, SingleStitch } from "./StitchTypes";

function escapeRegex(string: string) {
	return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function strCount(val: string, search: string) {
	return (val.match(new RegExp(escapeRegex(search), "g")) || []).length
}

export function parseStitch(row_str: string): BaseStitch {
	if (row_str === undefined || row_str.trim() === "") {
		return new BaseStitch();
	}
	let stack: BaseStitch[] = [new SilentStitch()];
	let label: string = "";
	let is_invalid = false;

	function addStitch() {
		// Clean up label, ignore "x" if it's being used as a multiply symbol
		label = label.trim();
		let count = 0;
		let match = label.match(/^[0-9]+/);
		// TODO: Remove from label
		if (match) {
			count = parseInt(match[0]);
			label = label.substring(match[0].length);
		}
		else {
			match = label.match(/[0-9]+$/);
			if (match) {
				count = parseInt(match[0]);
				label = label.substring(0, label.length - match[0].length);
			}
		}
		label = label.trim();
		if (label === "x") {
			label = "";
		}
		if (label.endsWith(" x")) {
			label = label.substring(0, label.length - 2);
		}

		if (label !== "") {
			if (count === 0) {
				const p = stack.pop()!;
				const s = new SilentStitch(p, SingleStitch.parse(label));
				stack.push(s);
			}
			else {
				stack[stack.length - 1].children.push(new RepeatStitch(SingleStitch.parse(label), count));
			}
		}
		else if (count !== 0) {
			const last = stack[stack.length - 1];
			const c = last.children;
			const p = c.splice(c.length - 1, 1)[0];
			const s = new SilentStitch(new RepeatStitch(p, count));
			last.children.push(s);
		}
		label = "";
	}

	if (strCount(row_str, "[") + strCount(row_str, "(") !== strCount(row_str, ")") + strCount(row_str, "]")) {
		row_str = "";
		is_invalid = true;
	}

	for (let i = 0; i < row_str.length; i++) {
		const curr = row_str[i];
		switch (curr) {
			case "(":
			case "[":
				addStitch();
				stack.push(new SilentStitch());
				break;
			case ")":
			case "]":
				addStitch();
				if (stack.length === 1) {
					is_invalid = true;
					break;
				}
				const p = new BaseStitch(stack.splice(stack.length - 1, 1)[0]);
				stack[stack.length - 1].children.push(p);
				break;
			case ",":
				addStitch();
				break;
			default:
				label += curr;
				break;
		}
		if (stack.length === 0) {
			is_invalid = true;
			break;
		}
	}
	if (is_invalid) {
		return new SingleStitch("Invalid");
	}
	addStitch();
	stack[0].cleanChildren();
	return stack[0];
}
