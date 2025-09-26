extends PanelContainer

@export var row_label: Label
@export var stitch_label: Label

var stitches := BaseStitch.new()


func _ready() -> void:
	stitches.children.append(SingleStitch.new("sc"))
	stitches.children.append(SingleStitch.new("sc1"))
	stitches.children.append(SingleStitch.new("sc2"))
	stitches.children.append(RepeatStitch.new(SingleStitch.new("sc"), 5))
	print(stitches)
	print(stitches.child(4))


func next_stitch() -> void:
	stitch_label.text = "New stitch"


func prev_stitch() -> void:
	stitch_label.text = "Old stitch"


func update_row(row: String) -> void:
	var stack: Array[BaseStitch] = [SilentStitch.new()]
	var strings := ["", ""]
	var is_invalid := false
	var add_single_stitch := func():
		if strings[0] != "":
			if strings[1] == "":
				print("added single stitch from label")
				stack[-1].children.append(SingleStitch.new(strings[0]))
			else:
				print("added repeat stitch from label")
				stack[-1].children.append(
					RepeatStitch.new(SingleStitch.new(strings[0]), int(strings[1]))
				)
		elif strings[1] != "":
			print("Repeated last stitch")
			var p: BaseStitch = stack.pop_back()
			var s := SilentStitch.new()
			s.children = [RepeatStitch.new(p, int(strings[1]))]
			stack.append(s)

		strings[0] = ""
		strings[1] = ""

	if row.count("(") != row.count(")"):
		row = ""
		is_invalid = true

	for i in row.length():
		var curr := row[i]
		if curr == " ":
			continue
		match curr:
			"(":
				add_single_stitch.call()
				stack.append(BaseStitch.new())
			")":
				add_single_stitch.call()
				if stack.size() == 1:
					is_invalid = true
					break
				var p: BaseStitch = stack.pop_back()
				stack[-1].children.append(p)
			"x" when i < row.length() - 1 and row[i + 1] == " ":
				pass
			"1", "2", "3", "4", "5", "6", "7", "8", "9", "0":
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
	stitches = stack[0]
	row_label.text = str(stitches)

