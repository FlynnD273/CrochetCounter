import { BaseStitch, RepeatStitch, SilentStitch, SingleStitch } from "./StitchTypes";

export function parseStitch(row_str: string): BaseStitch {
	let stack: BaseStitch[] = [new SilentStitch()];
	let label: string = "";
	let count: string = "";
	let is_invalid = false;

	function addStitch() {
		// Clean up label, ignore "x" if it's being used as a multiply symbol
		label = label.trim();
		if (label === "x") {
			label = "";
		}
		if (label.endsWith(" x")) {
			label = label.substring(0, label.length - 2);
		}

		if (label !== "") {
			if (count == "") {
				const p = stack.pop()!;
				const s = new SilentStitch(p, SingleStitch.parse(label));
				stack.push(s);
			}
			else {
				stack[stack.length - 1].children.push(new RepeatStitch(SingleStitch.parse(label), parseInt(count)));
			}
		}
		else if (count !== "") {
			const last = stack[stack.length - 1];
			const c = last.children;
			const p = c.splice(c.length - 1, 1)[0];
			const s = new SilentStitch(new RepeatStitch(p, parseInt(count)));
			last.children.push(s);
		}
		label = "";
		count = "";
	}

	if ((row_str.match(/\(/g) || []).length !== (row_str.match(/\)/g) || []).length) {
		row_str = "";
		is_invalid = true;
	}

	for (let i = 0; i < row_str.length; i++) {
		const curr = row_str[i];
		switch (curr) {
			case "(":
				addStitch();
				stack.push(new SilentStitch());
				break;
			case ")":
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
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
			case "0":
				count += curr;
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
