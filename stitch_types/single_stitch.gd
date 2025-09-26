class_name SingleStitch
extends BaseStitch

var label := ""


func _init(lbl: String) -> void:
	label = lbl
	children = []


func _get_length() -> int:
	return 1


func child(_idx: int) -> SingleStitch:
	return self


func _to_string() -> String:
	return label

