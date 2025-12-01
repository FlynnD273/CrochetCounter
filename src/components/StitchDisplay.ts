import van, { State } from "vanjs-core";
import { BaseStitch } from "../utils/StitchTypes";
import Banner from "./Banner";
import ExpDecay from "../utils/ExpDecay";

function lerp(a: number, b: number, ratio: number): number {
	return a * (1 - ratio) + b * ratio;
}

const StitchDisplay = (stitches: State<BaseStitch>, index: State<number>) => {
	const smooth_index = ExpDecay(index, 20);
	const snapped_index = van.derive(() => Math.floor(smooth_index.val));
	const remainder = van.derive(() => smooth_index.val - Math.floor(smooth_index.val));
	const { div } = van.tags;
	const prev_stitch = van.derive(() => snapped_index.val === -1 ? "" : snapped_index.val === 0 ? "<" : stitches.val.getChild(snapped_index.val - 1)?.toString() ?? "");
	const curr_stitch = van.derive(() => snapped_index.val === -1 ? "<" : snapped_index.val === stitches.val.length ? ">" : stitches.val.getChild(snapped_index.val)?.toString() ?? "");
	const next_stitch = van.derive(() => snapped_index.val === stitches.val.length - 1 ? ">" : stitches.val.getChild(snapped_index.val + 1)?.toString() ?? "");
	const next_next_stitch = van.derive(() => snapped_index.val === stitches.val.length - 2 ? ">" : stitches.val.getChild(snapped_index.val + 2)?.toString() ?? "");

	const curr_len = van.derive(() => Math.max(prev_stitch.val.length, curr_stitch.val.length, next_stitch.val.length));
	const next_len = van.derive(() => Math.max(curr_stitch.val.length, next_stitch.val.length, next_next_stitch.val.length));
	const stitch_spacing = van.derive(() => Math.max(lerp(curr_len.val, next_len.val, remainder.val) + 1, 5) * 0.6);
	const getPosition = (offset: number, scale: State<number>) => van.derive(() => (-remainder.val + offset) * stitch_spacing.val * (scale.val + 1) / 2);

	const prev_size = van.derive(() => lerp(0.5, 0, remainder.val));
	const curr_size = van.derive(() => lerp(1, 0.5, remainder.val));
	const next_size = van.derive(() => lerp(0.5, 1, remainder.val));
	const next_next_size = van.derive(() => lerp(0, 0.5, remainder.val));

	const prev_pos = getPosition(-1, prev_size);
	const curr_pos = getPosition(0, curr_size);
	const next_pos = getPosition(1, next_size);
	const next_next_pos = getPosition(2, next_next_size);

	return Banner(
		div({ class: "stitch", style: () => `transform: translateX(${prev_pos.val}em) scale(${prev_size.val});` }, prev_stitch),
		div({ class: "stitch", style: () => `transform: translateX(${curr_pos.val}em) scale(${curr_size.val});` }, curr_stitch),
		div({ class: "stitch", style: () => `transform: translateX(${next_pos.val}em) scale(${next_size.val});` }, next_stitch),
		div({ class: "stitch", style: () => `transform: translateX(${next_next_pos.val}em) scale(${next_next_size.val});` }, next_next_stitch),
	);
};
export default StitchDisplay;
