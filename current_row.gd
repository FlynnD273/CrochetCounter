extends LineEdit

@export var manager: StitchManager


func row_changed(idx: int) -> void:
	text = str(idx + 1)


func set_row(val: String) -> void:
	manager.row = int(val) - 1
