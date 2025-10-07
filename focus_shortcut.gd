extends Control

@export var shortcut: Shortcut

func _unhandled_input(event: InputEvent) -> void:
    if shortcut.matches_event(event):
        grab_focus()
