extends Node

var count := 0


func debounce_func(c: Callable, delay: float = 1) -> Callable:
	var timer: Array[SceneTreeTimer] = [null]
	return func(...args: Array):
		timer[0] = get_tree().create_timer(delay)
		timer[0].timeout.connect(
		(
		func(t):
			if timer[0] == t:
				count += 1
				c.callv(args)
				timer[0] = null
		).bind(timer[0]),
		)
