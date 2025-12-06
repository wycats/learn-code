# GitHub Authentication Strategy & Scopes

**Phase:** 39 (Community & Sharing)
**Date:** December 2025

## Objective

To empower users to "Export" their levels to GitHub and "Contribute" to the upstream game, Kibi must act as a GitHub Client. This requires requesting specific OAuth scopes and managing access tokens securely.

## The "Progressive Auth" Strategy

We adhere to the **Principle of Least Privilege**.

1.  **Base Login (Identity)**:
    - When a user logs in to play or save progress locally/cloud, we **only** request identity.
    - **Scopes**: `read:user`, `user:email`.
    - **Risk**: Low. Read-only profile data.

2.  **Developer Mode (Capabilities)**:
    - When a user explicitly chooses to "Export to GitHub" or "Submit a Contribution", we initiate an **Upgrade Flow**.
    - **Scopes**: `public_repo`.
    - **Risk**: High. Read/Write access to all public repositories.

### Why `public_repo`?

The `public_repo` scope is the minimum required to perform the following "Real Tool" actions:

- **Create Repository**: Creating a `kibi-levels` repository for the user.
- **Push Commits**: Saving level JSON files to that repository.
- **Fork**: Forking the `learn-coding` repository to the user's account (for contributions).
- **Pull Request**: Creating a PR from the user's fork to the upstream repo.

### Why not `repo`?

The `repo` scope grants access to **Private Repositories**.

- **Unnecessary**: Our pedagogy emphasizes Open Source.
- **High Risk**: We do not want liability for a user's private code.
- **Privacy**: Users are more likely to trust an app that only asks for public access.

## The "Dual Mode" Strategy

To balance **Low Floor** (Axiom 2) with **Tooling Parity** (Axiom 16), we introduce two modes of interaction with GitHub.

### 1. Apprentice Mode (Default)

- **Goal**: Frictionless cloud sync.
- **Action**: "Sync to GitHub".
- **Behavior**: Kibi handles the Git mechanics automatically.
  - Creates/Selects a `kibi-levels` repo.
  - Commits changes directly to `main`.
  - Syncs changes back to the device.
- **Mental Model**: "Cloud Save".

### 2. Engineer Mode (Power User)

- **Goal**: Teach real-world version control.
- **Action**: "Manage Version Control".
- **Behavior**: Kibi exposes the Git primitives.
  - **Commit**: User writes a commit message.
  - **Push**: User explicitly pushes changes.
  - **Pull Request**: User can submit a PR to their own repo (or upstream) for review.
- **Mental Model**: "Git Client".

## Token Management

### Storage

We must store the OAuth Access Token to perform actions on behalf of the user without forcing a re-login for every save.

- **Location**: `sessions` table in the database.
- **Column**: `github_access_token` (Text, Nullable).
- **Encryption**: **CRITICAL**. The token MUST be encrypted at rest using AES-256-GCM.
  - **Key**: `AUTH_TOKEN_SECRET` (Environment Variable).
  - **Rationale**: Defense in depth. If the database is leaked, the tokens are useless without the env var.
- **Lifecycle**:
  - The token is bound to the **Session**.
  - If the user logs out, the session is deleted, and the token is lost.
  - This ensures that "logging out" effectively revokes Kibi's immediate access (though the OAuth grant remains on GitHub until revoked).

### The Upgrade Flow

1.  User clicks "Export to GitHub".
2.  Client checks `session.githubAccessToken`.
3.  If missing:
    - Redirect user to `/login/github/authorize?scope=public_repo`.
    - **Important**: We must handle the "re-auth" gracefully, merging the new token into the _existing_ user account (or ensuring the GitHub ID matches).
4.  GitHub prompts: "Authorize Kibi to access your public repositories?"
5.  Callback:
    - Verify `state`.
    - Get Token.
    - **Encrypt** the token.
    - Update `session` with `encryptedGithubAccessToken`.
    - Redirect back to the Builder.

## Security Analysis (BFF & PKCE)

### Backend For Frontend (BFF) Pattern

Our SvelteKit architecture implements the **Backend For Frontend (BFF)** pattern, which is the current industry standard for securing Single Page Applications (SPAs).

- **Token Isolation**: OAuth Access Tokens are stored exclusively on the server (in the database, encrypted). They are **never** exposed to the browser client.
- **Session Management**: The browser only holds a secure, `HttpOnly`, `SameSite=Lax` session cookie. This prevents XSS attacks from exfiltrating the GitHub Access Token.
- **API Proxying**: All GitHub API requests are proxied through our SvelteKit server endpoints. The client requests "Export", and the server performs the GitHub API calls using the stored token.

### OAuth Security Best Practices

#### 1. PKCE (Proof Key for Code Exchange)

We implement PKCE for providers that support it to prevent authorization code interception attacks.

- **Google**: We generate a `code_verifier` and `code_challenge`. The verifier is stored in a secure, HttpOnly cookie and validated during the callback.
- **GitHub**: While GitHub's web flow relies primarily on `state` for CSRF protection, we are prepared to adopt PKCE as soon as their web flow supports it fully for confidential clients.

#### 2. Strict State Validation (CSRF Protection)

For every OAuth flow, we generate a cryptographically random `state` parameter.

- **Generation**: Using `arctic`'s secure random generator.
- **Storage**: Stored in a secure, HttpOnly cookie (`github_oauth_state`).
- **Validation**: In the callback, we strictly compare the returned `state` with the stored cookie. If they do not match, the request is immediately rejected (400 Bad Request). This effectively mitigates CSRF attacks against the login flow.

### Future Proofing: PKCE for GitHub

GitHub currently supports PKCE for "Device Flow" but not yet for standard Web Application flows.

- **Tracking**: We monitor the [GitHub Developer Changelog](https://github.blog/changelog/label/developer-platform/).
- **Action**: When PKCE support is announced for Web Apps, we will update `src/lib/server/auth.ts` to generate and validate `code_verifier` using `arctic`, aligning it with our Google implementation.

## Security Implications

- **Token Leakage**: If our database is compromised, attackers could modify users' public repos.
  - _Mitigation_: **Encryption at Rest**.
  - _Mitigation_: Short session lifetimes (30 days).
  - _Mitigation_: We only ask for `public_repo`.
- **CSRF**: Standard OAuth state validation prevents CSRF during the upgrade flow.
- **Scope Creep**: We must strictly avoid asking for `workflow` or `admin:org` unless absolutely necessary.

## Implementation Plan

1.  **Schema Update**: Add `githubAccessToken` to `sessions` table.
2.  **Auth Library**: Update `src/lib/server/auth.ts` to support dynamic scopes (or a separate `githubProvider` instance for the upgrade flow).
3.  **Endpoints**:
    - `GET /login/github/connect`: Initiates the upgrade flow.
    - `GET /login/github/callback`: Handle the token storage.
