# Authentication Strategy & Child Safety

## Problem Statement

We need to enable cloud persistence (saving levels/progress across devices) without violating privacy laws (COPPA, GDPR-K) or creating friction for our primary audience: children (3-8yo) and their "Architect" siblings (8-12yo).

## Constraints & Context

### 1. Legal & Safety (COPPA / GDPR-K)

- **Data Collection**: We cannot collect PII (Personally Identifiable Information) from children under 13 without verifiable parental consent.
- **Email**: Most children do not have their own email addresses.
- **Social Login**: "Sign in with Google/Facebook" is often restricted on child accounts (e.g., Google Family Link) or legally gray for <13s.

### 2. Device Ecosystem

- **Family Link (Android)**: Google's parental control system often blocks "Sign in with Google" for third-party apps unless the developer is an "Approved Partner" or the app is rated for families.
- **Shared Tablets**: A single iPad or Android tablet is often shared between siblings (e.g., Zoey and Jonas).
- **Restricted Browsers**: Kids often use browsers with strict tracking protection or "Kids Mode" which might wipe cookies/storage aggressively.

### 3. User Experience

- **Pre-Literate**: Zoey (4yo) cannot type a password or email.
- **Friction**: Asking a kid to "Check your email" to login is a non-starter.
- **Autonomy**: Jonas (8yo) wants to feel like he owns his account, but likely relies on a parent for the actual credentials.

## Proposed Models

### Model A: The "Netflix" Model (Parent-Managed)

- **Concept**: The _Parent_ creates a master account (using email/Google).
- **Profiles**: The parent creates "Profiles" for each child (Zoey, Jonas).
- **Login Flow**:
  1.  Parent logs in once on the device.
  2.  App presents a "Who is playing?" screen with avatars.
  3.  Child taps their face to switch context.
- **Pros**: Fully compliant (parent owns data), handles shared devices perfectly.
- **Cons**: Requires parent involvement to set up.

### Model B: The "Classroom" Model (Code-Based)

- **Concept**: Accounts are identified by a generated "Save Code" (e.g., `WIZARD-CAT-99`).
- **Login Flow**:
  1.  User clicks "Save Progress Online".
  2.  Server generates a random 3-word code.
  3.  User writes it down (or parent saves it).
  4.  To login on another device, type the code.
- **Pros**: No PII, no email, very "kid-friendly" (magic words).
- **Cons**: If code is lost, account is lost. Hard to reset.

### Model C: The "Magic Link" Model (Device Auth)

- **Concept**: Use WebAuthn / Passkeys if available, or a Magic Link sent to a parent's email that authorizes a _device_.
- **Flow**:
  1.  Enter Parent Email.
  2.  Parent clicks link on _their_ phone.
  3.  Tablet is authorized.
- **Pros**: Secure, no passwords.
- **Cons**: High friction for the child if the session expires.

## Recommendation: Hybrid "Netflix" Model

We should adopt a **Parent-Owned, Profile-Based** approach.

1.  **Anonymous First**: The app remains fully functional offline (Local-First).
2.  **Parent Upgrade**: To sync, a parent must create an account (Email or GitHub/Google).
3.  **Profiles**: The parent account can have multiple "Save Slots" or "Profiles" (e.g., "Slot 1", "Slot 2").
4.  **Pin Protection**: Optional simple PIN (colors or icons) to prevent siblings from overwriting each other's saves.

### Why this works for Family Link:

- The _Parent_ is the one signing in. They can use their standard Google Account (which isn't restricted like a child's).
- Once signed in, the session persists.
- The child interacts with the "Profile Picker", not the login screen.

## Research & Expert Review (Simulated)

To validate our strategy, we conducted a review simulating three key expert personas: **Dr. Play** (Child UX), **The Guardian** (Privacy/Legal), and **The Architect** (Systems).

### 1. Dr. Play (Child UX & Pedagogy)

> "The 'Netflix Model' is the gold standard for shared devices. Kids _love_ having their own 'space' (avatar, name), but they _hate_ login screens.
>
> **Critique of Model B (Codes)**: 'Save Codes' are fun for 8-year-olds (like secret agent codes) but a disaster for 4-year-olds. If Zoey loses her code, she cries. If she has to type it in, she gets frustrated.
>
> **Endorsement of Model A (Profiles)**: This gives Zoey autonomy. She opens the app, sees her face, and taps it. Done. It feels like _her_ app, even though Mom owns the account.
>
> **Requirement**: You need a 'Parent Gate' (e.g., 'Press and hold for 3 seconds' or 'What is 3 + 4?') to prevent Zoey from accidentally switching profiles or deleting Jonas's save."

### 2. The Guardian (Privacy & COPPA Compliance)

> "Model A is the safest path for compliance, provided you follow the 'Data Minimization' principle.
>
> **The Loophole**: By making the account _Parent-Owned_, you are not technically collecting PII from a child. You are collecting it from an adult who is consenting to create a sub-profile.
>
> **Red Flags**:
>
> - **Do not** ask for the child's full name. Use 'Nickname'.
> - **Do not** ask for exact birthdate if you don't need it. Age range is safer.
> - **Social Login**: Be careful with 'Sign in with Google'. On a Family Link device, a child _cannot_ use Google Sign-In for 3rd party apps. The _Parent_ must sign in. This reinforces the 'Parent-Owned' model."

### 4. The Family Link Constraint & Solution (QR Handshake)

> **The Problem**: On Android devices managed by Family Link, adding a second Google Account (the parent's) is often blocked or restricted. We cannot rely on the parent signing into the OS on the child's device.
>
> **The Solution: Cross-Device Auth (QR Handshake)**
> Instead of signing in _on_ the child's device, the parent signs in on _their own_ device and authorizes the child's device.
>
> **The Flow**:
>
> 1.  **Child's Device**: Taps "Parent Login". Shows a QR Code (containing a unique session ID).
> 2.  **Parent's Device**: Opens the app (or camera), logs in with Google/GitHub, and scans the code.
> 3.  **Authorization**: The server links the child's device session to the parent's account.
> 4.  **Result**: The child's device is now authenticated as the Parent, but without adding the Google Account to the Android OS.

## Final Decision: The "Netflix" Model + QR Handshake

Based on the expert review and prior art (Khan Academy Kids, Duolingo ABC), we will proceed with **Model A: Parent-Owned, Profile-Based**, augmented with a **QR Handshake** for restricted devices.

### Refined Requirements

1.  **Parent Gate (Sudo Mode)**: Instead of easily bypassed "Math Gates", we will use **Re-authentication** for sensitive actions. To access the "Parent Dashboard" (Account Settings, Delete Profile), the user must re-confirm their Google/GitHub credentials. This is the only truly secure gate.
2.  **Profile Picker**: A visual, icon-based screen for selecting the active user.
3.  **Rich Customization**: Kids should be able to customize their profile (Avatar, Color, Nickname) freely. This fosters ownership.
4.  **Merge Flow**: A dedicated UI to handle migrating anonymous local data to a specific profile upon login.
5.  **Nickname Only**: The profile creation form should explicitly ask for a "Nickname" to discourage full names.
6.  **QR Handshake**: Implement a mechanism to authorize a device via a secondary device (Parent's phone) to bypass OS-level account restrictions.

## Technical Implications

- **Schema**:
  - `User` table (Parent): email, auth_provider_id.
  - `Profile` table (Child): name, avatar, parent_id.
  - `Level` table: owner_id (links to Profile, not User).
  - `DeviceAuth` table: session_id, status (pending/authorized), user_id (null until authorized).
- **Auth Provider**:
  - **GitHub**: Good for "Yehuda" (Expert Mentor) and "Jonas" (if he's older).
  - **Google**: Most common for parents. We will rely on the parent signing in once; subsequent "Sudo Mode" checks can use the cached session or require a fresh token if critical.
  - **No Email/Password**: We will avoid the complexity and security risks of managing passwords/magic links directly.

## Next Steps

1.  Validate the "Profile" schema approach.
2.  Prototype the "Who is playing?" screen.
3.  Research "Google Sign-In for Parents on Family Link devices" (does it work if the parent signs in on a kid's device?).
