class_name RepeatStitch
extends BaseStitch

var repeat: int = 0


func _init(c: BaseStitch, rpt: int) -> void:
	children = [c]
	repeat = rpt


func _get_length() -> int:
	if repeat == 0:
		return 0
	return children[0].length * repeat


func _to_string() -> String:
	if children.size() == 0:
		return "EMPTY"
	return str(children[0], " x", repeat)


func child(idx: int) -> SingleStitch:
	if repeat == 0:
		return null
	return children[0].child(idx % children[0].length)


func debug_to_string(indent: int = 0) -> String:
	var space := _get_debug_spacing(indent)
	return (
		"%sRepeat stitch [\n%s\n%s] (x%d)"
		% [space, children[0].debug_to_string(indent + 1), space, repeat]
	)
