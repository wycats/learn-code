// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundManager } from './sound';

// Mock Web Audio API
const mockAudioContext = {
	state: 'suspended',
	resume: vi.fn(),
	createBufferSource: vi.fn(),
	createGain: vi.fn(),
	createOscillator: vi.fn(),
	decodeAudioData: vi.fn(),
	currentTime: 0,
	destination: {}
};

const mockSource = {
	buffer: null,
	loop: false,
	connect: vi.fn(),
	start: vi.fn(),
	stop: vi.fn(),
	onended: null
};

const mockGain = {
	connect: vi.fn(),
	gain: {
		setValueAtTime: vi.fn(),
		linearRampToValueAtTime: vi.fn(),
		exponentialRampToValueAtTime: vi.fn()
	}
};

const mockOscillator = {
	type: 'sine',
	frequency: {
		setValueAtTime: vi.fn(),
		linearRampToValueAtTime: vi.fn(),
		exponentialRampToValueAtTime: vi.fn()
	},
	connect: vi.fn(),
	start: vi.fn(),
	stop: vi.fn()
};

describe('SoundManager', () => {
	let soundManager: SoundManager;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Setup AudioContext mock
		mockAudioContext.createBufferSource.mockReturnValue(mockSource);
		mockAudioContext.createGain.mockReturnValue(mockGain);
		mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
		mockAudioContext.decodeAudioData.mockResolvedValue({} as AudioBuffer);
		mockAudioContext.currentTime = 1; // Start at 1s to avoid throttling on first play (0 - 0 < 0.1)

		// Stub global AudioContext
		const MockAudioContext = vi.fn(function () {
			return mockAudioContext;
		});
		vi.stubGlobal('AudioContext', MockAudioContext);
		window.AudioContext = MockAudioContext as unknown as typeof AudioContext;

		soundManager = new SoundManager();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should initialize AudioContext on first interaction', () => {
		soundManager.play('step');
		expect(window.AudioContext).toHaveBeenCalled();
	});

	it('should resume AudioContext if suspended', () => {
		mockAudioContext.state = 'suspended';
		soundManager.play('step');
		expect(mockAudioContext.resume).toHaveBeenCalled();
	});

	it('should play a step sound', () => {
		soundManager.play('step');
		expect(mockAudioContext.createOscillator).toHaveBeenCalled();
		expect(mockAudioContext.createGain).toHaveBeenCalled();
		expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
		expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
		expect(mockOscillator.start).toHaveBeenCalled();
		expect(mockOscillator.stop).toHaveBeenCalled();
	});

	it('should throttle sounds played too quickly', () => {
		soundManager.play('step');
		expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);

		// Try to play again immediately (time hasn't advanced)
		soundManager.play('step');
		expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);

		// Advance time
		mockAudioContext.currentTime += 0.2;
		soundManager.play('step');
		expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
	});

	it('should play different sound types', () => {
		const types = ['turn', 'fail', 'click', 'pickup', 'drop', 'delete', 'sweep', 'hurt'] as const;

		types.forEach((type) => {
			soundManager.play(type);
			expect(mockAudioContext.createOscillator).toHaveBeenCalled();
			vi.clearAllMocks();
			mockAudioContext.currentTime += 0.2; // Advance time to avoid throttling
		});
	});

	it('should play win sound (multiple notes)', () => {
		soundManager.play('win');
		// Win sound plays 4 notes + 1 unused oscillator created in play()
		expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(5);
	});

	it('should load and play audio files', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
		});

		await soundManager.load('bgm', '/sounds/bgm.mp3');
		expect(global.fetch).toHaveBeenCalledWith('/sounds/bgm.mp3');
		expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();

		const source = soundManager.playFile('bgm');
		expect(source).toBe(mockSource);
		expect(mockSource.start).toHaveBeenCalled();
	});

	it('should handle loading errors gracefully', async () => {
		global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await soundManager.load('bgm', '/sounds/bgm.mp3');
		expect(consoleSpy).toHaveBeenCalled();
	});

	it('should play ambient sound', async () => {
		// Mock buffer loading first
		global.fetch = vi.fn().mockResolvedValue({
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
		});
		await soundManager.load('ambient', '/sounds/ambient.mp3');

		soundManager.playAmbient('ambient');
		expect(mockSource.loop).toBe(true);
		expect(mockSource.start).toHaveBeenCalled();
	});

	it('should stop ambient sound', async () => {
		// Mock buffer loading first
		global.fetch = vi.fn().mockResolvedValue({
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
		});
		await soundManager.load('ambient', '/sounds/ambient.mp3');

		soundManager.playAmbient('ambient');
		soundManager.stopAmbient();
		expect(mockSource.stop).toHaveBeenCalled();
	});

	it('should replace ambient sound if another is played', async () => {
		// Mock buffer loading first
		global.fetch = vi.fn().mockResolvedValue({
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
		});
		await soundManager.load('ambient1', '/sounds/ambient1.mp3');
		await soundManager.load('ambient2', '/sounds/ambient2.mp3');

		soundManager.playAmbient('ambient1');
		expect(mockSource.start).toHaveBeenCalledTimes(1);

		soundManager.playAmbient('ambient2');
		expect(mockSource.stop).toHaveBeenCalledTimes(1); // Stop first
		expect(mockSource.start).toHaveBeenCalledTimes(2); // Start second
	});

	it('should not play if disabled', () => {
		soundManager.toggle(false);
		soundManager.play('step');
		expect(window.AudioContext).not.toHaveBeenCalled();
	});

	it('should return null if playing unknown file', () => {
		const result = soundManager.playFile('unknown');
		expect(result).toBeNull();
	});
});
