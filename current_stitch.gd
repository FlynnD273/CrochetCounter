extends LineEdit

@export var manager: StitchManager


func set_stitch(val: String) -> void:
	manager.set_stitch_index(int(val) - 1)


func stitch_changed(idx: int) -> void:
	text = str(idx + 1)
