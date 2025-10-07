import van, { State } from "vanjs-core";

const Fraction = (numer: State<number>, denom: State<number>) => {
	const { input, div } = van.tags;
	return div({ class: "fraction" },
		input(
			{
				size: numer.rawVal.toString().length,
				class: "card fraction-num",
				type: "text",
				onkeyup: evt => {
					if (evt.key === "Enter") {
						numer.val = Number(evt.target?.value ?? "") - 1;
						evt.preventDefault();
					}
				},
				value: () => numer.val + 1,
				oninput: evt => evt.target.size = evt.target.value.length,
			}),
		"/",
		div(() => denom.val),
	);
};
export default Fraction;
