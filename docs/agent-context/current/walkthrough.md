# Walkthrough: P2P Sharing (Phase 21)

## Overview

This phase focuses on enabling direct sharing of levels and packs between users without relying on a central server.

## Progress

- [x] **Magic QR Codes**: Implemented `ShareService` using `lz-string` for compression and `qrcode` for generation. Added a "Share" button in the Builder and a "Scan" button on the Home screen using `html5-qrcode`.
- [ ] **WebRTC Handshake**: Pending.
- [ ] **Offline Support**: Pending.

## Key Decisions

- **Compression**: Used `lz-string` (`compressToEncodedURIComponent`) to create URL-safe strings that can be embedded directly in the QR code as a link (`/play?level=...`). This allows scanning with a standard camera app.
- **Signaling**: TBD.
