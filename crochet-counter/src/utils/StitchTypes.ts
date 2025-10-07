export class BaseStitch {
	children: BaseStitch[];

	constructor(...children: BaseStitch[]) {
		this.children = children;
	}

	get length(): number {
		return this.children.reduce((acc, item) => item.length + acc, 0)
	}

	getChild(idx: number): SingleStitch | undefined {
		if (idx < 0 || idx >= this.length) {
			return undefined;
		}
		let curr_idx = 0;
		let child_idx = 0;
		for (const c of this.children) {
			if (curr_idx + c.length <= idx) {
				curr_idx += c.length;
			}
			else {
				break;
			}
			child_idx++;
		}
		return this.children[child_idx].getChild(idx - curr_idx);
	}

	toString(): string {
		return `[${this.children.join(", ")}]`;
	}

	cleanChildren(): void {
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].cleanChildren();
			if (this.children[i].length == 0) {
				this.children.splice(i, 1);
				i--;
			}
		}
	}
}

export class SingleStitch extends BaseStitch {
	label: string = "";
	constructor(label: string) {
		super();
		this.label = label;
	}

	get length(): number {
		return 1;
	}

	getChild(_idx: number): SingleStitch | undefined {
		return this;
	}

	toString(): string {
		return this.label;
	}

	static parse(label: string): SingleStitch {
		if (label.endsWith("inc")) {
			return new IncStitch(label);
		}
		return new SingleStitch(label);
	}
}

export class RepeatStitch extends BaseStitch {
	repeat: number = 0;

	constructor(child: BaseStitch, repeat: number) {
		super(child);
		this.repeat = repeat;
	}

	get length() {
		if (this.repeat === 0) {
			return 0;
		}
		return this.children[0].length * this.repeat;
	}

	toString(): string {
		return `${this.children[0]} x${this.repeat}`;
	}

	getChild(idx: number): SingleStitch | undefined {
		if (this.repeat === 0) {
			return undefined;
		}
		return this.children[0].getChild(idx % this.children[0].length);
	}
}

export class SilentStitch extends BaseStitch {
	toString(): string {
		return this.children.join(", ");
	}
}

export class IncStitch extends SingleStitch {
	constructor(label: string) {
		super(label);
		this.children = [new SingleStitch(`${label}_1`), new SingleStitch(`${label}_2`)];
	}

	get length() {
		return 2
	}

	getChild(idx: number): SingleStitch | undefined {
		return this.children[idx] as SingleStitch;
	}
}
