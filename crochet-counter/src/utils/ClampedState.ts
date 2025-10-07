import van, { State } from "vanjs-core";

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

const ClampedState = (value: number, min: number | State<number>, max: number | State<number>) => {
	const getVal = (v: number | State<number>) => typeof v === "object" && "val" in v ? v.val : v;
	const state = van.state(clamp(value, getVal(min), getVal(max)));
	return new Proxy(state, {
		set(target: State<number>, p: string, newValue: number) {
			if (p === "val") {
				target.val = clamp(newValue, getVal(min), getVal(max));
				return true;
			}
			target[p] = newValue;
			return true
		},
	})
}

export default ClampedState;
