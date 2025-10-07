import van, { State } from "vanjs-core";
import { BaseStitch } from "../utils/StitchTypes";

const StitchDisplay = (stitches: State<BaseStitch>, index: State<number>) => {
	const { div } = van.tags;
	const prev_stitch = van.derive(() => index.val === 0 ? "<" : stitches.val.getChild(index.val - 1)?.toString() ?? "");
	const curr_stitch = van.derive(() => index.val == stitches.val.length ? ">" : stitches.val.getChild(index.val)?.toString() ?? "");
	const next_stitch = van.derive(() => index.val == stitches.val.length - 1 ? ">" : stitches.val.getChild(index.val + 1)?.toString() ?? "");
	return div({ class: "stitch-display" }, div(prev_stitch), div(curr_stitch), div(next_stitch));
};
export default StitchDisplay;
