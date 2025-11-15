import van, { State } from "vanjs-core";

const Fraction = (numer: State<number>, denom: State<number>) => {
	const { input, div } = van.tags;
	const numer_text = van.state(numer.rawVal + "");
	van.derive(() => { numer_text.val = (numer.val + 1) + "" });
	const numerator = input(
		{
			class: "card fraction-num",
			type: "text",
			autocomplete: "off",
			onkeydown: evt => {
				if (evt.key === "Enter") {
					const val = parseInt(numer_text.val ?? "");
					numer.val = val - 1;
					evt.preventDefault();
				}
			},
			size: () => numer_text.val.length,
			value: () => numer_text.val,
			oninput: evt => numer_text.val = evt.target.value,
		});
	return div({ class: "fraction" },
		numerator,
		div("/"),
		div(() => denom.val),
	);
};
export default Fraction;
