class_name BaseStitch
extends Node

## Total number of unrolled stitches
var length: int:
    get:
        return _get_length()

## All child stitches
var children: Array[BaseStitch] = []


func _get_length() -> int:
    return children.reduce(func(acc, item): return item.length + acc, 0)


## Gets the stitch at the specified index. Unrolls everything to get the right count
func child(idx: int) -> SingleStitch:
    if idx < 0 or idx >= length:
        return null
    var curr_idx := 0
    var child_index := 0
    for c in children:
        if curr_idx + c.length <= idx:
            curr_idx += c.length
        else:
            break
        child_index += 1

    return children[child_index].child(idx - curr_idx)


func _to_string() -> String:
    return "[" + ", ".join(children) + "]"


func debug_to_string(indent: int = 0) -> String:
    var space := _get_debug_spacing(indent)
    return (
		"%sBase stitch[\n%s\n%s]"
        % [space, ",\n".join(children.map(func(x): return x.debug_to_string(indent + 1))), space]
    )


func _get_debug_spacing(indent: int) -> String:
    return "-".repeat(indent)
