class_name RowEditPopup
extends Window

signal accepted

@export var rows_input: CodeEdit

var rows: Array[String]


func submit_rows() -> void:
	rows.assign(rows_input.text.split("\n"))
	rows = rows.filter(func(x): return x != "")
	hide()
	accepted.emit()
