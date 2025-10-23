import van from "vanjs-core";

const Toast = (content: string) => {
	const { div } = van.tags;

	const toast = div({ class: "toast" }, content);
	setTimeout(() => toast.remove(), 2000);
	return toast;
};
export default Toast;
