extends Label


func on_rows_changed(arr: Array) -> void:
	text = "/ " + str(arr.size())
