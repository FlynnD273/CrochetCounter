class_name StitchManager
extends PanelContainer

signal index_changed(index: int)
signal row_changed(row: int)
signal rows_changed(rows: Array)
signal stitches_changed(stitches: BaseStitch)

const END_MARKER := ">"
const START_MARKER := "<"

@export var transition_duration := 0.2
@export var stitch_spacing: float = 150

@onready var row_label: Label = %RowLabel
@onready var row_input: LineEdit = %Row
@onready var curr_stitch_label: Label = %CurrentStitch
@onready var next_stitch_label: Label = %NextStitch
@onready var next_next_stitch_label: Label = %NextNextStitch
@onready var prev_stitch_label: Label = %PrevStitch
@onready var row_edit: RowEditPopup = %RowsDialog

var SAVE_PATH = "user://state.tres"
var curr_tween: Tween
var index := 0:
	set(val):
		index = min(stitches.length, max(val, 0))
		save.curr_stitch_index = index
		if stitches.length == 0:
			prev_stitch_label.text = "-"
			curr_stitch_label.text = "-"
			next_stitch_label.text = "-"
			return
		if index == 0:
			prev_stitch_label.text = START_MARKER
		else:
			prev_stitch_label.text = str(stitches.child(index - 1))
		if index == stitches.length - 1:
			next_stitch_label.text = END_MARKER
		elif index == stitches.length:
			next_stitch_label.text = ""
		else:
			next_stitch_label.text = str(stitches.child(index + 1))
		if index == stitches.length - 2:
			next_next_stitch_label.text = END_MARKER
		elif index >= stitches.length - 1:
			next_next_stitch_label.text = ""
		else:
			next_next_stitch_label.text = str(stitches.child(index + 2))
		if index == stitches.length:
			curr_stitch_label.text = END_MARKER
		else:
			curr_stitch_label.text = str(stitches.child(index))
var next_index: int = 0:
	set(val):
		next_index = min(stitches.length, max(val, 0))
		index_changed.emit(next_index)
var row := 0:
	set(val):
		row = max(min(rows.size() - 1, val), 0)
		save.curr_row_index = row
		if rows.size() > 0:
			row_input.text = rows[row]
		set_stitch_index(0)
		parse_current_row()
		row_changed.emit(row)
var rows: Array[String]:
	set(val):
		rows = val
		save.rows = rows
		rows_changed.emit(rows)
var save: SaveState
var smooth_index: float = 0:
	set(val):
		smooth_index = min(stitches.length, max(val, 0))
		index = floor(smooth_index)
		set_smooth_index_positions()
var stitches := BaseStitch.new():
	set(val):
		stitches = val
		row_label.text = str(stitches)
		stitches_changed.emit(stitches)


func _ready() -> void:
	get_viewport().size_changed.connect(set_smooth_index_positions)
	load_state()


func _notification(what):
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		save_state()
		get_tree().quit()


func add_stitch_index(delta: int) -> void:
	if curr_tween != null and curr_tween.is_running():
		curr_tween.kill()
		smooth_index = next_index
	next_index = index + delta
	curr_tween = create_tween()
	(
		curr_tween
		. tween_property(self, "smooth_index", next_index, transition_duration)
		. set_trans(Tween.TRANS_EXPO)
		. set_ease(Tween.EASE_OUT)
	)


func load_state() -> void:
	if ResourceLoader.exists(SAVE_PATH):
		save = ResourceLoader.load(SAVE_PATH)
	else:
		save = SaveState.new()
	if OS.has_feature("web"):
		save.changed.connect(Debouncer.debounce_func(save_state, 0.2))
	else:
		save.changed.connect(Debouncer.debounce_func(save_state))
	rows = save.rows
	row = save.curr_row_index
	set_stitch_index(save.curr_stitch_index)


func next_stitch() -> void:
	if index == stitches.length:
		row += 1
		set_stitch_index(0)
	else:
		add_stitch_index(1)


func open_row_editor() -> void:
	row_edit.rows_input.text = "\n".join(rows)
	row_edit.popup_centered()
	if get_viewport().get_visible_rect().size.y < row_edit.size.y:
		row_edit.size.y = int(get_viewport().get_visible_rect().size.y - 20)


func parse_current_row() -> void:
	var row_str := rows[row]
	var stack: Array[BaseStitch] = [SilentStitch.new()]
	var strings := ["", ""]
	var is_invalid := false
	var add_single_stitch := func():
		strings[0] = strings[0].strip_edges()
		if strings[0] == "x":
			strings[0] = ""
		print("strings[0]: ", strings[0])
		if strings[0].ends_with(" x"):
			strings[0] = strings[0].substr(0, strings[0].length() - 2)
		if strings[0] != "":
			if strings[1] == "":
				var p: BaseStitch = stack.pop_back()
				var s: BaseStitch = SilentStitch.new()
				s.children = [p, SingleStitch.parse(strings[0])]
				stack.append(s)
			else:
				(
					stack[-1]
					. children
					. append(
						RepeatStitch.new(
							SingleStitch.parse(strings[0]), int(strings[1])
						),
					)
				)
		elif strings[1] != "":
			var p: BaseStitch = stack[-1].children.pop_back()
			var s: BaseStitch = SilentStitch.new()
			s.children.append(RepeatStitch.new(p, int(strings[1])))
			stack[-1].children.append(s)
		strings[0] = ""
		strings[1] = ""
	if row_str.count("(") != row_str.count(")"):
		row_str = ""
		is_invalid = true
	for i in row_str.length():
		var curr := row_str[i]
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
			"x" when i < row_str.length() - 1 and row_str[i + 1] == " ":
				pass
			"1", "2", "3", "4", "5", "6", "7", "8", "9", "0" when (
				(i > 0 and (row_str[i - 1] == " " or strings[0].ends_with(" x")))
				or strings[1] != ""
			):
				strings[1] += curr
			",":
				add_single_stitch.call()
			_:
				strings[0] += curr
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


func prev_stitch() -> void:
	add_stitch_index(-1)


func row_editor_closed() -> void:
	rows = row_edit.rows
	row = 0
	update_row(rows[row])


func save_state():
	ResourceSaver.save(save, SAVE_PATH)


func set_smooth_index_positions() -> void:
	var rect := get_viewport_rect()
	var parent: Control = curr_stitch_label.get_parent()
	var center := rect.size.x / 2 - 25
	var offset := smooth_index - index
	prev_stitch_label.scale = (Vector2.ONE * (smoothstep(1, -1, smooth_index - index)))
	curr_stitch_label.scale = (Vector2.ONE * (smoothstep(2, 0, smooth_index - index)))
	next_stitch_label.scale = (Vector2.ONE * (smoothstep(-1, 1, smooth_index - index)))
	next_next_stitch_label.scale = (
		Vector2.ONE * (smoothstep(0, 2, smooth_index - index))
	)
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
		parent.size.y / 2
		- next_next_stitch_label.size.y * next_next_stitch_label.scale.y / 2
	)


func set_stitch_index(idx: int) -> void:
	if curr_tween != null and curr_tween.is_running():
		curr_tween.kill()
		smooth_index = next_index
	add_stitch_index(idx - index)


func update_row(row_str: String) -> void:
	rows[row] = row_str
	save.emit_changed()
	parse_current_row()
