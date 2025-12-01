# Phase 21: P2P Sharing Walkthrough

## Overview

In this phase, we implemented a peer-to-peer sharing system that allows Architects to share their creations directly with Explorers without relying on a centralized server. This aligns with our "Offline First" and "Local Ownership" axioms.

## Key Features

### 1. Magic QR Codes (Single Level Sharing)

For sharing individual levels, we implemented a compressed URL scheme.

- **Mechanism**: The level JSON is minified, compressed (using `lz-string`), and encoded into a URL hash.
- **QR Code**: This URL is then converted into a QR code using `qrcode`.
- **Experience**: The receiver scans the QR code, and the app instantly loads the level from the URL hash. No network request required (other than loading the app itself).

### 2. WebRTC Handshake (Pack Sharing)

For larger payloads like full Level Packs, we implemented a WebRTC data channel.

- **Signaling**: Instead of a signaling server, we use QR codes to exchange the SDP Offer and Answer.
  1. **Sender** creates an Offer -> QR Code.
  2. **Receiver** scans Offer -> Generates Answer -> QR Code.
  3. **Sender** scans Answer -> Connection Established.
- **Data Transfer**: Once connected, the pack data is serialized and sent over the WebRTC DataChannel.
- **Experience**: A "magic handshake" that feels like beaming data between devices.

### 3. UI Integration

- **Builder Toolbar**: Added a "Share" button (Share2 icon) to the main toolbar.
- **Share Modal**: Provides options for "Link/QR" (Single Level) and "P2P Transfer" (Pack).
- **P2P Wizard**: A step-by-step modal (`P2PModal`) guiding users through the scan-scan-connect process.

## Technical Decisions

- **Library Choice**: Used `simple-peer` (via a lightweight wrapper `P2PConnection`) to abstract WebRTC complexity.
- **Compression**: `lz-string` was chosen for its efficiency in compressing JSON for URL safety.
- **Offline Support**: The entire flow works offline (once the app is loaded), leveraging the Service Worker for asset caching.

## Challenges & Solutions

- **QR Code Density**: Large levels created QR codes that were too dense to scan easily.
  - _Solution_: We implemented `lz-string` compression to significantly reduce the payload size. For very large levels/packs, we force the WebRTC flow.
- **Visual Regressions**: The new toolbar button caused layout shifts in the visual tests.
  - _Solution_: We updated the visual snapshots to reflect the new UI state.
- **Accessibility**: The new modals had some focus/tabindex issues.
  - _Solution_: We audited and fixed the ARIA roles and tabindex attributes in `ShareModal` and `P2PModal`.
