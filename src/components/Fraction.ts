import van, { State } from "vanjs-core";

const Fraction = (numer: State<number>, denom: State<number>) => {
	const { input, div } = van.tags;
	const numerator = input(
		{
			class: "card fraction-num",
			type: "text",
			onkeyup: evt => {
				if (evt.key === "Enter") {
					numer.val = parseInt(evt.target?.value ?? "") - 1;
					updateSize();
					evt.preventDefault();
				}
			},
			value: () => numer.val + 1,
			oninput: evt => evt.target.size = evt.target.value.length,
		});
	var updateSize = () => { numerator.size = (numer.val + 1).toString().length; numerator.value = numer.val + 1 + ""; };
	van.derive(updateSize);
	return div({ class: "fraction" },
		numerator,
		div("/"),
		div(() => denom.val),
	);
};
export default Fraction;
