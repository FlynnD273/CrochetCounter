class_name StitchManager
extends PanelContainer

@export var transition_duration := 0.2
@export var stitch_spacing: float = 150
@export var row_label: Label
@export var curr_stitch_label: Label
@export var next_stitch_label: Label
@export var next_next_stitch_label: Label
@export var prev_stitch_label: Label
@export var row_progress_label: Label

var index := 0:
    set(val):
        index = min(stitches.length, max(val, 0))
        if stitches.length == 0:
            prev_stitch_label.text = "-"
            curr_stitch_label.text = "-"
            next_stitch_label.text = "-"
            row_progress_label.text = ""
            return
        row_progress_label.text = (
            "(%d/%d)" % [min(stitches.length - 1, max(next_index, 0)) + 1, stitches.length]
        )
        if index == 0:
            prev_stitch_label.text = "⥒"
        else:
            prev_stitch_label.text = str(stitches.child(index - 1))

        if index == stitches.length - 1:
            next_stitch_label.text = "⥓"
        elif index == stitches.length:
            next_stitch_label.text = ""
        else:
            next_stitch_label.text = str(stitches.child(index + 1))

        if index == stitches.length - 2:
            next_next_stitch_label.text = "⥓"
        elif index >= stitches.length - 1:
            next_next_stitch_label.text = ""
        else:
            next_next_stitch_label.text = str(stitches.child(index + 2))

        if index == stitches.length:
            curr_stitch_label.text = "⥓"
        else:
            curr_stitch_label.text = str(stitches.child(index))

var smooth_index: float = 0:
    set(val):
        smooth_index = min(stitches.length, max(val, 0))
        index = floor(smooth_index)
        var rect := get_viewport_rect()
        var parent: Control = curr_stitch_label.get_parent()
        var center := rect.size.x / 2 - 25
        var offset := smooth_index - index

        prev_stitch_label.scale = (Vector2.ONE * (smoothstep(1, -1, smooth_index - index)))
        curr_stitch_label.scale = (Vector2.ONE * (smoothstep(2, 0, smooth_index - index)))
        next_stitch_label.scale = (Vector2.ONE * (smoothstep(-1, 1, smooth_index - index)))
        next_next_stitch_label.scale = (Vector2.ONE * (smoothstep(0, 2, smooth_index - index)))

        prev_stitch_label.position.x = (
            center
            - (offset + 1) * stitch_spacing * (prev_stitch_label.scale.x + 1) / 2
            - prev_stitch_label.size.x * prev_stitch_label.scale.x / 2
        )
        curr_stitch_label.position.x = (
            center
            - offset * stitch_spacing * (curr_stitch_label.scale.x + 1) / 2
            - curr_stitch_label.size.x * curr_stitch_label.scale.x / 2
        )
        next_stitch_label.position.x = (
            center
            - (offset - 1) * stitch_spacing * (next_stitch_label.scale.x + 1) / 2
            - next_stitch_label.size.x * next_stitch_label.scale.x / 2
        )
        next_next_stitch_label.position.x = (
            center
            - (offset - 2) * stitch_spacing * (next_next_stitch_label.scale.x + 1) / 2
            - next_next_stitch_label.size.x * next_next_stitch_label.scale.x / 2
        )

        curr_stitch_label.position.y = (
            parent.size.y / 2 - curr_stitch_label.size.y * curr_stitch_label.scale.y / 2
        )
        prev_stitch_label.position.y = (
            parent.size.y / 2 - prev_stitch_label.size.y * prev_stitch_label.scale.y / 2
        )
        next_stitch_label.position.y = (
            parent.size.y / 2 - next_stitch_label.size.y * next_stitch_label.scale.y / 2
        )
        next_next_stitch_label.position.y = (
            parent.size.y / 2 - next_next_stitch_label.size.y * next_next_stitch_label.scale.y / 2
        )

var next_index := 0
var curr_tween: Tween

var stitches := BaseStitch.new():
    set(val):
        stitches = val
        row_label.text = str(stitches)
        smooth_index = 0
        next_index = 0
        if curr_tween != null:
            curr_tween.kill()
            curr_tween = null
        prev_stitch()


func _ready() -> void:
    get_viewport().size_changed.connect(func(): smooth_index = smooth_index)


func next_stitch() -> void:
    if curr_tween != null and curr_tween.is_running():
        curr_tween.kill()
        smooth_index = next_index
    next_index = index + 1
    curr_tween = create_tween()
    (
        curr_tween
        . tween_property(self, "smooth_index", next_index, transition_duration)
        . set_trans(Tween.TRANS_EXPO)
        . set_ease(Tween.EASE_OUT)
    )


func prev_stitch() -> void:
    if curr_tween != null and curr_tween.is_running():
        curr_tween.kill()
        smooth_index = next_index
    next_index = index - 1
    curr_tween = create_tween()
    (
        curr_tween
        . tween_property(self, "smooth_index", next_index, transition_duration)
        . set_trans(Tween.TRANS_EXPO)
        . set_ease(Tween.EASE_OUT)
    )


func update_row(row: String) -> void:
    var stack: Array[BaseStitch] = [SilentStitch.new()]
    var strings := ["", ""]
    var is_invalid := false
    var add_single_stitch := func():
        if strings[0] != "":
            if strings[1] == "":
                print("New single")
                print("Stack: ", ", ".join(stack))
                var p: BaseStitch = stack.pop_back()
                print("Stack: ", ", ".join(stack))
                var s: BaseStitch = SilentStitch.new()
                s.children = [p, SingleStitch.parse(strings[0])]
                print("Adding: ", s)
                stack.append(s)
                print("Stack: ", ", ".join(stack))
            else:
                print("New repeat")
                stack[-1].children.append(
                    RepeatStitch.new(SingleStitch.parse(strings[0]), int(strings[1]))
                )
        elif strings[1] != "":
            print("Repeat last")
            var p: BaseStitch = stack[-1].children.pop_back()
            var s: BaseStitch = SilentStitch.new()
            s.children.append(RepeatStitch.new(p, int(strings[1])))
            stack[-1].children.append(s)

        strings[0] = ""
        strings[1] = ""

    if row.count("(") != row.count(")"):
        row = ""
        is_invalid = true

    for i in row.length():
        var curr := row[i]
        if curr == " ":
            continue
        print("Processing '", curr, "'")
        match curr:
            "(":
                add_single_stitch.call()
                stack.append(SilentStitch.new())
            ")":
                add_single_stitch.call()
                if stack.size() == 1:
                    is_invalid = true
                    break
                var p: BaseStitch = BaseStitch.new()
                p.children = [stack.pop_back()]
                stack[-1].children.append(p)
            "x" when i < row.length() - 1 and row[i + 1] == " ":
                pass
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "0" when (
                (i > 0 and row[i - 1] == " ") or strings[1] != ""
            ):
                strings[1] += curr
            ",":
                add_single_stitch.call()
            _:
                strings[0] += curr
        print(strings, "___", ", ".join(stack))

        if stack.size() == 0:
            is_invalid = true
            break

    if is_invalid:
        stitches = SilentStitch.new()
        row_label.text = "Invalid row notation"
        return

    add_single_stitch.call()
    stack[0].clean_children()
    stitches = stack[0]
