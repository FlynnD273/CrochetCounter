export class UserState {
	rows: string[];
	stitch_index: number;
	row_index: number;
	title: string;
	constructor(rows: string[], stitch_index: number, row_index: number, title: string) {
		this.rows = rows;
		this.stitch_index = stitch_index;
		this.row_index = row_index;
		this.title = title;
	}
}
