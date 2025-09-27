class_name RepeatStitch
extends BaseStitch


func _init(c: BaseStitch, repeat: int) -> void:
    children = []
    children.resize(repeat)
    children.fill(c)


func _to_string() -> String:
    if children.size() == 0:
        return "EMPTY"
    return str(children[0], " x", children.size())


func debug_to_string(indent: int = 0) -> String:
    var space := _get_debug_spacing(indent)
    return (
		"%sRepeat stitch [\n%s\n%s] (x%d)"
        % [space, children[0].debug_to_string(indent + 1), space, children.size()]
    )
