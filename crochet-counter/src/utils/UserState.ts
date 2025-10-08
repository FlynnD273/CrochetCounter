export class UserState {
	rows: string[];
	stitch_index: number;
	row_index: number;
	constructor(rows: string[], stitch_index: number, row_index: number) {
		this.rows = rows;
		this.stitch_index = stitch_index;
		this.row_index = row_index;
	}
}
