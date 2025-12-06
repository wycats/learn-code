# Testing Philosophy: No Mocks, Just Fakes

## The Problem with Mocks

Mocking libraries (like `vi.mock`, `jest.mock`, `sinon`) allow you to hijack imports and replace them with artificial behavior. While convenient, this leads to several long-term issues:

1.  **Coupling to Implementation**: Mocks often mirror the internal implementation details of the code under test. If you refactor the implementation (e.g., rename a private method or change a call order), the test breaks even if the behavior is correct.
2.  **Drift**: Mocks are manual simulations of reality. Over time, the real implementation changes, but the mock stays the same. Your tests pass, but the application fails in production.
3.  **Global State Pollution**: Mocks often rely on global state (module cache patching), which can lead to flaky tests where one test affects another.
4.  **Refactoring Resistance**: Because tests are coupled to implementation details, developers become afraid to refactor code because "fixing the tests" takes longer than the actual change.

## The Solution: Dependency Injection & Fakes

Instead of hijacking the language's module system, we use **Dependency Injection (DI)** and **Fakes**.

### 1. Define Interfaces

Define the contract for your external dependencies (Persistence, API, File System, etc.).

```typescript
// src/lib/services/persistence.ts
export interface PersistenceService {
	save(data: any): Promise<void>;
	load(id: string): Promise<any>;
}
```

### 2. Implement "Real" and "Fake" Versions

Create a production implementation that talks to the real world, and a fake implementation that runs in memory.

**Real Implementation (Browser/Node):**

```typescript
export class BrowserPersistence implements PersistenceService {
	async save(data: any) {
		await indexedDB.put('data', data);
	}
}
```

**Fake Implementation (Test):**

```typescript
export class InMemoryPersistence implements PersistenceService {
	private storage = new Map();

	async save(data: any) {
		this.storage.set(data.id, data);
	}
}
```

### 3. Inject Dependencies

Pass the dependency into your class or function. Use a default value for convenience in production code.

```typescript
export class GameManager {
	constructor(private persistence: PersistenceService = new BrowserPersistence()) {}

	async saveGame() {
		await this.persistence.save(this.state);
	}
}
```

### 4. Test with Fakes

In your tests, instantiate the class with the Fake. No `vi.mock` required.

```typescript
test('saves the game', async () => {
	const persistence = new InMemoryPersistence();
	const manager = new GameManager(persistence);

	await manager.saveGame();

	expect(await persistence.load('game-1')).toBeDefined();
});
```

## Rules

1.  **No `vi.mock()`**: Do not use module mocking.
2.  **No `vi.spyOn()`**: Do not spy on methods to check if they were called. Check the _state_ of the Fake instead.
3.  **No `vi.stubGlobal()`**: Do not patch global variables like `localStorage` or `window`. Wrap them in a service and Fake it.
4.  **State Verification over Behavior Verification**: Assert that the _outcome_ is correct (e.g., "item is in the database"), not that a specific function was called (e.g., "save() was called with X").

## Benefits

- **Refactoring Safety**: You can change how `GameManager` works internally. As long as it saves the data to the persistence service, the test passes.
- **Speed**: In-memory fakes are instant.
- **Realism**: Fakes can implement simple logic (like validation) that mocks often skip, catching more bugs.
- **Simplicity**: No complex mocking setup/teardown logic.
