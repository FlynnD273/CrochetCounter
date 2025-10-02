class_name IncStitch
extends SingleStitch


func _init(lbl: String) -> void:
    super(lbl)
    children = [SingleStitch.new(label + "₁"), SingleStitch.new(label + "₂")]


func _get_length() -> int:
    return 2


func child(idx: int) -> SingleStitch:
    return children[idx]


func debug_to_string(indent: int = 0) -> String:
    return _get_debug_spacing(indent) + "Inc stitch " + label
