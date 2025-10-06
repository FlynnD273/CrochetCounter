extends Label


func on_stitches_changed(stitch: BaseStitch) -> void:
	text = " / " + str(stitch.length)
