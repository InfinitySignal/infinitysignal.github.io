import { parse, parseFragment, serialize } from "parse5";

export { parse, parseFragment, serialize };

export function findAll(node, predicate) {
	const result = [];
	if (predicate(node)) result.push(node);
	for (const child of node.childNodes || []) {
		result.push(...findAll(child, predicate));
	}
	return result;
}

export function attr(node, name) {
	return node.attrs?.find((item) => item.name === name)?.value;
}

export function textContent(node) {
	return node.nodeName === "#text"
		? node.value
		: (node.childNodes || []).map(textContent).join("");
}

export function escapeHtml(value) {
	return String(value).replace(
		/[&<>"']/g,
		(char) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[char]
	);
}

export function appendHtml(parent, html, prepend = false) {
	const nodes = parseFragment(html).childNodes;
	for (const node of nodes) node.parentNode = parent;
	if (prepend) parent.childNodes.unshift(...nodes);
	else parent.childNodes.push(...nodes);
}
