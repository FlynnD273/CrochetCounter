import van, { State } from "vanjs-core";

const Fraction = (numer: State<number>, denom: State<number>) => {
	const { input, div } = van.tags;
	const numerator = input(
		{
			class: "card fraction-num",
			type: "text",
			onkeyup: evt => {
				if (evt.key === "Enter") {
					const val = parseInt(evt.target?.value ?? "") - 1;
					numer.val = val + 1;
					Promise.resolve().then(() => numer.val = val);
					evt.preventDefault();
				}
			},
			value: () => numer.val + 1,
			oninput: evt => evt.target.size = evt.target.value.length,
		});
	van.derive(() => numerator.size = (numer.val + 1).toString().length);
	return div({ class: "fraction" },
		numerator,
		div("/"),
		div(() => denom.val),
	);
};
export default Fraction;
