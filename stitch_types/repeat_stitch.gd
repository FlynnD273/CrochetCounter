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
