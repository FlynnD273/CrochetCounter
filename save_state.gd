class_name SaveState
extends Resource

@export var curr_row_index: int = 0:
	set(val):
		if val == curr_row_index:
			return
		curr_row_index = val
		emit_changed()
@export var curr_stitch_index: int = 0:
	set(val):
		if val == curr_stitch_index:
			return
		curr_stitch_index = val
		emit_changed()
@export var rows: Array[String] = [""]:
	set(val):
		if val == rows:
			return
		rows = val
		emit_changed()
