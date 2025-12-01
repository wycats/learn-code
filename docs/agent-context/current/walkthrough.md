# Walkthrough: P2P Sharing (Phase 21)

## Overview

This phase focuses on enabling direct sharing of levels and packs between users without relying on a central server.

## Progress

- [x] **Magic QR Codes**: Implemented `ShareService` using `lz-string` for compression and `qrcode` for generation. Added a "Share" button in the Builder and a "Scan" button on the Home screen using `html5-qrcode`.
- [x] **WebRTC Handshake**: Implemented `P2PConnection` service and `P2PModal` UI. Users can now share full Level Packs by exchanging QR codes (Offer/Answer) to establish a direct WebRTC connection.
- [x] **Offline Support**: Verified that the existing Service Worker caches all necessary assets (including the new P2P libraries). The P2P handshake uses local ICE candidates when offline, allowing sharing on local networks without internet access.

## Key Decisions

- **Compression**: Used `lz-string` (`compressToEncodedURIComponent`) to create URL-safe strings that can be embedded directly in the QR code as a link (`/play?level=...`). This allows scanning with a standard camera app.
- **Signaling**: Implemented a "Serverless" signaling mechanism. The SDP Offer and Answer are compressed and exchanged via QR codes. This avoids the need for a signaling server, keeping the architecture purely P2P and offline-capable.
- **UI Flow**: Created a step-by-step wizard (`P2PModal`) that guides users through the Offer -> Scan -> Answer -> Scan -> Connect process.
