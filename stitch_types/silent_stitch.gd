class_name SilentStitch
extends BaseStitch


func _to_string() -> String:
	return ", ".join(children)


func debug_to_string(indent: int = 0) -> String:
	var space := _get_debug_spacing(indent)
	return (
		"%sSilent stitch [\n%s\n%s]"
		% [space, ",\n".join(children.map(func(x): return x.debug_to_string(indent + 1))), space]
	)

