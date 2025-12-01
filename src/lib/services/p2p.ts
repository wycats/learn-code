import { ShareService } from './share';

export type P2PRole = 'sender' | 'receiver';
export type P2PStatus =
	| 'new'
	| 'gathering'
	| 'ready'
	| 'connecting'
	| 'connected'
	| 'disconnected'
	| 'failed';

export class P2PConnection {
	pc: RTCPeerConnection;
	dc: RTCDataChannel | null = null;
	role: P2PRole;
	onStatusChange: (status: P2PStatus) => void;
	onData: (data: unknown) => void;

	constructor(
		role: P2PRole,
		onStatusChange: (status: P2PStatus) => void,
		onData: (data: unknown) => void
	) {
		this.role = role;
		this.onStatusChange = onStatusChange;
		this.onData = onData;

		this.pc = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
		});

		this.pc.onconnectionstatechange = () => {
			console.log('Connection State:', this.pc.connectionState);
			switch (this.pc.connectionState) {
				case 'connected':
					this.onStatusChange('connected');
					break;
				case 'disconnected':
					this.onStatusChange('disconnected');
					break;
				case 'failed':
					this.onStatusChange('failed');
					break;
			}
		};

		if (role === 'sender') {
			this.dc = this.pc.createDataChannel('pack-transfer');
			this.setupDataChannel(this.dc);
		} else {
			this.pc.ondatachannel = (e) => {
				this.dc = e.channel;
				this.setupDataChannel(this.dc);
			};
		}
	}

	private setupDataChannel(dc: RTCDataChannel) {
		dc.onopen = () => {
			console.log('DataChannel Open');
			this.onStatusChange('connected');
		};
		dc.onmessage = (e) => {
			try {
				const data = JSON.parse(e.data);
				this.onData(data);
			} catch (err) {
				console.error('Failed to parse P2P message', err);
			}
		};
	}

	async createOffer(): Promise<string> {
		this.onStatusChange('gathering');
		const offer = await this.pc.createOffer();
		await this.pc.setLocalDescription(offer);
		await this.waitForIceGathering();
		this.onStatusChange('ready');
		return ShareService.compress(this.pc.localDescription);
	}

	async handleOffer(compressedOffer: string): Promise<string> {
		const offer = ShareService.decompress<RTCSessionDescriptionInit>(compressedOffer);
		if (!offer) throw new Error('Invalid offer');

		await this.pc.setRemoteDescription(offer);

		this.onStatusChange('gathering');
		const answer = await this.pc.createAnswer();
		await this.pc.setLocalDescription(answer);
		await this.waitForIceGathering();
		this.onStatusChange('ready');

		return ShareService.compress(this.pc.localDescription);
	}

	async handleAnswer(compressedAnswer: string) {
		const answer = ShareService.decompress<RTCSessionDescriptionInit>(compressedAnswer);
		if (!answer) throw new Error('Invalid answer');
		await this.pc.setRemoteDescription(answer);
		this.onStatusChange('connecting');
	}

	private waitForIceGathering(): Promise<void> {
		return new Promise((resolve) => {
			if (this.pc.iceGatheringState === 'complete') {
				resolve();
			} else {
				const check = () => {
					if (this.pc.iceGatheringState === 'complete') {
						this.pc.removeEventListener('icegatheringstatechange', check);
						resolve();
					}
				};
				this.pc.addEventListener('icegatheringstatechange', check);
				// Timeout fallback (2s)
				setTimeout(resolve, 2000);
			}
		});
	}

	send(data: unknown) {
		if (this.dc && this.dc.readyState === 'open') {
			this.dc.send(JSON.stringify(data));
		} else {
			console.error('DataChannel not open');
		}
	}

	close() {
		this.dc?.close();
		this.pc.close();
	}
}
