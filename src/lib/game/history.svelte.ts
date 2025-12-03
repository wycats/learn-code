export class HistoryManager<T> {
	history = $state<T[]>([]);
	future = $state<T[]>([]);
	isInteracting = false;
	maxHistory = 50;

	constructor(initialState?: T) {
		if (initialState) {
			// We don't push initial state to history, history represents *past* states.
			// The current state is held by the consumer.
		}
	}

	pushState(currentState: T) {
		// Deep clone the current state using $state.snapshot if available, or structuredClone
		// Since this is a generic class, we assume the consumer passes a snapshot or we snapshot it here.
		// However, $state.snapshot is a Svelte rune function. We can't easily use it inside a generic class
		// unless we pass it in or assume T is serializable.
		// Let's assume the consumer passes the *snapshot* of the state.

		this.history.push(currentState);
		if (this.history.length > this.maxHistory) this.history.shift();
		this.future = []; // Clear redo stack on new action
	}

	undo(currentState: T): T | null {
		if (this.history.length === 0) return null;
		const prev = this.history.pop();
		if (prev) {
			this.future.push(currentState);
			return prev;
		}
		return null;
	}

	redo(currentState: T): T | null {
		if (this.future.length === 0) return null;
		const next = this.future.pop();
		if (next) {
			this.history.push(currentState);
			return next;
		}
		return null;
	}

	startInteraction(currentState: T) {
		if (!this.isInteracting) {
			this.pushState(currentState);
			this.isInteracting = true;
		}
	}

	endInteraction() {
		this.isInteracting = false;
	}

	clear() {
		this.history = [];
		this.future = [];
		this.isInteracting = false;
	}

	get canUndo() {
		return this.history.length > 0;
	}

	get canRedo() {
		return this.future.length > 0;
	}
}
