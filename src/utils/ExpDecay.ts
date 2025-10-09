import van, { State } from "vanjs-core";

function expDecayFunc(a: number, b: number, speed: number, dt: number) {
	return b + (a - b) * Math.exp(-speed * dt);
}

const ExpDecay = (target: State<number>, speed: number) => {
	const currVal = van.state(target.rawVal);
	let last_timestamp = performance.now();
	const dampedCallback = (time: number) => {
		if (Math.abs(currVal.val - target.val) < 1e-2) {
			if (currVal.val !== target.val) {
				currVal.val = target.val;
			}
		}
		else {
			currVal.val = expDecayFunc(currVal.rawVal, target.rawVal, speed, (time - last_timestamp) / 1000);
			last_timestamp = time;
			requestAnimationFrame(dampedCallback);
		}
	}
	van.derive(() => {
		if (Math.abs(currVal.rawVal - target.val) < 1e-2) {
			if (currVal.rawVal !== target.val) {
				currVal.val = target.val;
			}
		}
		else {
			last_timestamp = performance.now()
			requestAnimationFrame(dampedCallback);
		}
	});
	return currVal;
}

export default ExpDecay;
