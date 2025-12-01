# Implementation Plan - Phase 21

## Goal

Enable Architects to share their creations directly with Explorers without a centralized server.

## Proposed Changes

### 1. Magic QR Codes

**Problem:** Sharing a single level currently requires exporting a file and sending it.
**Solution:**

- Compress the level JSON (using `lz-string` or similar).
- Encode it into a QR code.
- Create a "Scan QR" feature in the app to load the level.

### 2. WebRTC Handshake

**Problem:** Sharing large packs via QR code is impractical due to size limits.
**Solution:**

- Use a simple signaling server (or manual copy-paste signaling) to establish a WebRTC connection.
- Transfer the pack data directly between devices.

### 3. Offline Support

**Problem:** Sharing should work even without internet access (if using local network or QR).
**Solution:**

- Ensure the PWA caches necessary assets.
- Verify that the sharing flow works offline.

## Execution Steps

1.  **QR Code Sharing**
    - Implement compression/decompression logic.
    - Add "Share Level" button in Builder.
    - Add "Scan Level" button in Home/Library.
2.  **WebRTC Implementation**
    - Research simple signaling options (PeerJS?).
    - Implement the handshake UI.
3.  **Offline Verification**
    - Test with network disabled.
