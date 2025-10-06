class_name SaveState
extends Resource

@export var curr_row_index: int = 0:
	set(val):
		curr_row_index = val
		emit_changed()
@export var curr_stitch_index: int = 0:
	set(val):
		curr_stitch_index = val
		emit_changed()
@export var rows: Array[String] = [""]:
	set(val):
		rows = val
		emit_changed()
