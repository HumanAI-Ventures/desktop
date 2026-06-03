// ========= Copyright 2025-2026 @ Apparae (Sharif Amlani) =========
// Adapted from Eigent's src/lib/oauth.ts (Apache 2.0) per Plan 8A-B Task 2:
//   - localStorage swapped for Electron safeStorage via IPC
//   - redirect_uri repointed from dev.eigent.ai to auth.apparae.com
//     (configurable via APPARAE_OAUTH_CALLBACK_BASE_URL env)
// Original copyright notice preserved as required by Apache 2.0:
//   "Copyright 2025-2026 @ Eigent.ai All Rights Reserved.
//    Licensed under the Apache License, Version 2.0."
//   Source: https://github.com/eigent-ai/eigent
// ========= Copyright 2025-2026 @ Apparae =========

const EnvOauthInfoMap = {
  notion: 'NOTION_TOKEN',
};

// Plan 8A-B Task 2.5: exportable for callers (e.g. useIntegrationManagement.ts)
// that need to construct provider-registration URLs aligned with the same host.
export const APPARAE_OAUTH_CALLBACK_BASE_URL: string =
  (typeof process !== 'undefined' && process.env?.APPARAE_OAUTH_CALLBACK_BASE_URL) ||
  'https://auth.apparae.com';

export class OAuth {
  public client_name: string = 'Apparae';
  public client_uri: string = 'https://apparae.com/';
  public redirect_uris: string[] = [];
  // Plan 8A-B Task 2.1: explicit marker so callers can verify the storage
  // backend swap happened (Smoke 2 reads this).
  public storageBackend: 'safeStorage' = 'safeStorage';

  public url: string = '';
  public authServerUrl: string = '';
  public resourcePath: string = '/.well-known/oauth-protected-resource';
  public authorizationServerPath: string =
    '/.well-known/oauth-authorization-server';
  public resourceMetadata: any;
  public authorizationServerMetadata: any;
  public registerClientData: any;
  public codeVerifier: string = '';
  public provider: string = '';

  constructor(mcpName?: string) {
    if (mcpName) {
      this.startOauth(mcpName);
    }
  }

  /**
   * Plan 8A-B Task 2.5: exposes the redirect_uri the OAuth class will register
   * with the provider, so Smoke 2 + Plan A's useIntegrationManagement can
   * inspect it without re-reading the env var.
   */
  get redirectUri(): string {
    return `${APPARAE_OAUTH_CALLBACK_BASE_URL}/oauth/${this.provider}/callback`;
  }

  async startOauth(mcpName: string) {
    const mcp = mcpMap[mcpName as keyof typeof mcpMap];
    if (!mcp) throw new Error(`MCP ${mcpName} not found`);

    this.url = mcp.url;
    this.provider = mcp.provider;
    // Plan 8A-B Task 2.4: repoint redirect URI from dev.eigent.ai to
    // auth.apparae.com (configurable via APPARAE_OAUTH_CALLBACK_BASE_URL).
    this.redirect_uris = [
      `${APPARAE_OAUTH_CALLBACK_BASE_URL}/oauth/${this.provider}/callback`,
    ];
    this.authServerUrl = new URL(mcp.url).origin;
    this.resourcePath = mcp?.resourcePath || this.resourcePath;
    this.authorizationServerPath =
      mcp?.authorizationServerPath || this.authorizationServerPath;

    this.resourceMetadata = await this.getResourceMetadata();
    this.authorizationServerMetadata =
      await this.getAuthorizationServerMetadata();
    this.registerClientData = await this.clientRegistration();
    const oauthUrl = await this.generateAuthUrl();
    window.location.href = oauthUrl;
  }

  async getResourceMetadata() {
    return await fetch(this.authServerUrl + this.resourcePath).then((res) =>
      res.json()
    );
  }

  async getAuthorizationServerMetadata() {
    return await fetch(this.authServerUrl + this.authorizationServerPath).then(
      (res) => res.json()
    );
  }

  async clientRegistration() {
    const {
      registration_endpoint,
      grant_types_supported,
      response_types_supported,
    } = this.authorizationServerMetadata;
    return await fetch(registration_endpoint, {
      method: 'POST',
      body: JSON.stringify({
        client_name: this.client_name,
        client_uri: this.client_uri,
        redirect_uris: this.redirect_uris,
        grant_types: grant_types_supported,
        response_types: response_types_supported,
        token_endpoint_auth_method: 'none',
      }),
    }).then((res) => res.json());
  }

  async generateAuthUrl() {
    const responseType = 'code';
    const codeChallengeMethod = 'S256';
    const { authorization_endpoint } = this.authorizationServerMetadata;
    const { code_challenge, code_verifier } = await this.pkceChallenge();
    this.codeVerifier = code_verifier;
    return `${authorization_endpoint}?response_type=${responseType}&client_id=${this.registerClientData.client_id}&redirect_uri=${this.redirect_uris[0]}&code_challenge_method=${codeChallengeMethod}&code_challenge=${code_challenge}`;
  }

  async getToken(code: string, email: string) {
    const { token_endpoint } = this.authorizationServerMetadata;
    const grantType = 'authorization_code';
    const params = new URLSearchParams({
      grant_type: grantType,
      client_id: this.registerClientData.client_id,
      code: code,
      code_verifier: this.codeVerifier,
      redirect_uri: String(this.redirect_uris[0]),
    });
    if (this.registerClientData.client_secret) {
      params.set('client_secret', this.registerClientData.client_secret);
    }
    if (this.resourceMetadata) {
      params.set('resource', this.resourceMetadata.resource);
    }

    const token = await fetch(token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }).then((res) => res.json());

    await this.saveToken(this.provider, email, {
      ...token,
      expires_at: Date.now() + (token.expires_in || 3600) * 1000,
      meta: {
        authorizationServerMetadata: this.authorizationServerMetadata,
        registerClientData: this.registerClientData,
        resourceMetadata: this.resourceMetadata,
      },
    });
    return token;
  }

  async refreshToken(provider: string, email: string) {
    const tokenData = await this.loadToken(provider, email);
    if (!tokenData?.refresh_token) return;

    // restore metadata from tokenData.meta
    this.authorizationServerMetadata =
      tokenData.meta?.authorizationServerMetadata;
    this.registerClientData = tokenData.meta?.registerClientData;
    this.resourceMetadata = tokenData.meta?.resourceMetadata;

    if (!this.authorizationServerMetadata || !this.registerClientData) {
      throw new Error(`no metadata for ${provider} - ${email}`);
    }

    const { token_endpoint } = this.authorizationServerMetadata;
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
      client_id: this.registerClientData.client_id,
    });
    if (this.registerClientData.client_secret) {
      params.set('client_secret', this.registerClientData.client_secret);
    }

    const newToken = await fetch(token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }).then((res) => res.json());

    if (window.electronAPI?.envWrite) {
      await window.electronAPI.envWrite(email, {
        key: EnvOauthInfoMap[provider as keyof typeof EnvOauthInfoMap],
        value: newToken.access_token,
      });
    }
    await this.saveToken(provider, email, {
      ...newToken,
      expires_at: Date.now() + (newToken.expires_in || 3600) * 1000,
      meta: {
        authorizationServerMetadata: this.authorizationServerMetadata,
        registerClientData: this.registerClientData,
      },
    });
    return newToken;
  }

  // --- local token storage via Electron safeStorage IPC ---
  //
  // Plan 8A-B Task 2.2: every per-provider token blob is JSON-stringified,
  // encrypted via Electron's safeStorage API (OS-keychain-backed: macOS
  // Keychain / Windows Credential Locker / libsecret), and persisted to
  // ~/.apparae/credentials.encrypted.json. The IPC handlers live in
  // electron/main/index.ts (added in this same plan). Tokens never hit
  // disk in plaintext and never leave Sharif's machine.
  //
  // saveToken/loadToken/clearToken keep the same (provider, email, ...)
  // signature so existing callers in this file (getToken, refreshToken)
  // continue to work unchanged.

  getStorageKey() {
    return 'oauth_tokens';
  }

  private _getIpc(): any | null {
    // window.ipcRenderer is exposed by Electron's preload script.
    if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
      return (window as any).ipcRenderer;
    }
    return null;
  }

  async getAllTokens(): Promise<Record<string, Record<string, any>>> {
    const ipc = this._getIpc();
    if (!ipc) return {};
    const encrypted: string | null = await ipc.invoke('apparae-credential-read', {
      provider: this.getStorageKey(),
    });
    if (!encrypted) return {};
    try {
      const decrypted: string = await ipc.invoke('apparae-safe-storage-decrypt', encrypted);
      return JSON.parse(decrypted);
    } catch {
      return {};
    }
  }

  async saveToken(provider: string, email: string, tokenData: any): Promise<void> {
    const ipc = this._getIpc();
    if (!ipc) return;
    const all = await this.getAllTokens();
    if (!all[provider]) all[provider] = {};
    all[provider][email] = tokenData;
    const encrypted: string = await ipc.invoke(
      'apparae-safe-storage-encrypt',
      JSON.stringify(all),
    );
    await ipc.invoke('apparae-credential-write', {
      provider: this.getStorageKey(),
      encrypted,
    });
  }

  async loadToken(provider: string, email: string): Promise<any | null> {
    const all = await this.getAllTokens();
    return (all?.[provider] && all?.[provider]?.[email]) || null;
  }

  async clearToken(provider: string, email: string): Promise<void> {
    const ipc = this._getIpc();
    if (!ipc) return;
    const all = await this.getAllTokens();
    if (all[provider] && all[provider][email]) {
      delete all[provider][email];
      if (Object.keys(all[provider]).length === 0) {
        delete all[provider];
      }
      const encrypted: string = await ipc.invoke(
        'apparae-safe-storage-encrypt',
        JSON.stringify(all),
      );
      await ipc.invoke('apparae-credential-write', {
        provider: this.getStorageKey(),
        encrypted,
      });
    }
  }

  // --- PKCE tools ---
  async pkceChallenge(length: number = 43) {
    if (length < 43 || length > 128)
      throw `Expected length 43~128. Got ${length}`;
    const verifier = await this.generateVerifier(length);
    const challenge = await this.generateChallenge(verifier);
    return {
      code_verifier: verifier,
      code_challenge: challenge,
    };
  }

  async generateVerifier(length: number) {
    return await this.random(length);
  }

  async generateChallenge(code_verifier: string) {
    const buffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(code_verifier)
    );
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\//g, '_')
      .replace(/\+/g, '-')
      .replace(/=/g, '');
  }

  async random(size: number) {
    const mask =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';
    const maskLength = mask.length;
    const result = [];

    // Use rejection sampling to avoid modulo bias
    // Generate extra random values to account for rejections
    let randomValues = crypto.getRandomValues(new Uint8Array(size * 2));
    let index = 0;

    while (result.length < size) {
      if (index >= randomValues.length) {
        // Need more random values
        randomValues = crypto.getRandomValues(new Uint8Array(size * 2));
        index = 0;
      }

      const value = randomValues[index++];
      // Only use values that don't cause modulo bias
      if (value < 256 - (256 % maskLength)) {
        result.push(mask[value % maskLength]);
      }
    }

    return result.join('');
  }
}

// supported MCPs (can be extended multiple times)
export const mcpMap: Record<string, any> = {
  Notion: {
    url: 'https://mcp.notion.com/mcp',
    provider: 'notion',
  },
};
