import van, { State } from "vanjs-core";

const Fraction = (numer: State<number>, denom: State<number>) => {
	const { input, div } = van.tags;
	const numer_text = van.state(numer.rawVal + "");
	van.derive(() => numer_text.val = (numer.val + 1) + "");
	return div({ class: "fraction" },
		input(
			{
				class: "card fraction-num",
				type: "text",
				onkeydown: evt => {
					if (evt.key === "Enter") {
						const val = parseInt(evt.target?.value ?? "");
						numer.val = val - 1;
						evt.preventDefault();
					}
				},
				size: () => numer_text.val.length,
				value: () => numer.val + 1,
				oninput: evt => numer_text.val = evt.target.value,
			}),
		div("/"),
		div(() => denom.val),
	);
};
export default Fraction;
