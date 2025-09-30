class_name IncStitch
extends BaseStitch

var label := "inc"


func _init() -> void:
	children = [SingleStitch.new("inc₁"), SingleStitch.new("inc₂")]


func _get_length() -> int:
	return 2


func _to_string() -> String:
	return label


func debug_to_string(indent: int = 0) -> String:
	return _get_debug_spacing(indent) + "Single stitch " + label

