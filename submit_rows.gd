class_name RowEditPopup
extends Popup

@onready var rows_input: CodeEdit = %CodeEdit

var rows: Array[String]


func close() -> void:
	popup_hide.emit()


func update_manager() -> void:
	rows.assign(rows_input.text.split("\n"))
	rows = rows.filter(func(x): return x != "")
	hide()
