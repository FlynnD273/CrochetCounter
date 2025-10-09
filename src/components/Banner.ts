import van from "vanjs-core";

const Banner = (...children: (HTMLElement | string)[]) => {
	const { div } = van.tags;
	return (
		div({ class: "banner" }, ...children)
	);
};
export default Banner;
