// ========= Copyright 2025-2026 @ Apparae (HumanAI Ventures) =========
// Apparae MCP catalog - 14 placeholder rows for the Settings -> Connectors UI.
//
// Per docs/prd_agency_plans/14b-v1-stage-8a-substrate-solo/A-eigent-ui-adapt.md
// (Stage 8A Plan A, Task 3). Each row describes a Model Context Protocol
// server that Apparae's role agents can call. The actual MCP wiring (clients,
// OAuth, env handling) lives in Plans C + D; this file is the UI catalog
// source consumed by MCPMarket.tsx + MCP.tsx.
//
// Rows whose `backingPlan` is not 'already-built' render with a
// "Coming Soon" badge until their backing plan merges.

export type ApparaeMcpRow = {
  /** Unique slug used for routes, install dispatch, and config keys. */
  slug: string;
  /** Human-readable name shown in the catalog. */
  displayName: string;
  /** Provenance / trust tier. */
  vendor: 'official' | 'eigent-toolkit' | 'community' | 'apparae-internal';
  /** Auth model the MCP server uses. */
  authModel:
    | 'oauth_pkce'
    | 'oauth_token_header'
    | 'api_key'
    | 'bot_token'
    | 'app_private_key'
    | 'no_auth';
  /** Wire transport. */
  transport: 'stdio' | 'http' | 'sse';
  /** lucide-react icon name (or local icon-pack key). */
  iconKey: string;
  /** Short description shown under the row. */
  description: string;
  /** Vendor docs URL for the MCP server. */
  docsUrl: string;
  /** True if this MCP is load-bearing for v1 ship. */
  v1LoadBearing: boolean;
  /** Which Stage 8A plan ships the backing implementation. */
  backingPlan:
    | '8A-C'
    | '8A-D'
    | '8A-eigent-inherited'
    | 'already-built';
};

export const APPARAE_MCP_CATALOG: ApparaeMcpRow[] = [
  {
    slug: 'slack',
    displayName: 'Slack',
    vendor: 'official',
    authModel: 'oauth_pkce',
    transport: 'http',
    iconKey: 'slack',
    description: 'Post messages, manage channels, search workspace history.',
    docsUrl: 'https://docs.slack.dev/ai/slack-mcp-server/',
    v1LoadBearing: true,
    backingPlan: '8A-C',
  },
  {
    slug: 'github',
    displayName: 'GitHub',
    vendor: 'official',
    authModel: 'oauth_pkce',
    transport: 'http',
    iconKey: 'github',
    description: 'Open PRs, manage issues, read repository content.',
    docsUrl: 'https://github.com/github/github-mcp-server',
    v1LoadBearing: true,
    backingPlan: '8A-C',
  },
  {
    slug: 'supabase',
    displayName: 'Supabase',
    vendor: 'official',
    authModel: 'oauth_pkce',
    transport: 'http',
    iconKey: 'database',
    description: 'Query database, manage schema, deploy edge functions.',
    docsUrl: 'https://supabase.com/docs/guides/ai-tools/mcp',
    v1LoadBearing: true,
    backingPlan: '8A-C',
  },
  {
    slug: 'stripe',
    displayName: 'Stripe',
    vendor: 'official',
    authModel: 'api_key',
    transport: 'http',
    iconKey: 'credit-card',
    description: 'Manage subscriptions, refunds, customers, payments.',
    docsUrl: 'https://docs.stripe.com/mcp',
    v1LoadBearing: true,
    backingPlan: '8A-C',
  },
  {
    slug: 'resend',
    displayName: 'Resend',
    vendor: 'official',
    authModel: 'api_key',
    transport: 'http',
    iconKey: 'mail',
    description:
      'Send transactional + cold email, manage domains + webhooks.',
    docsUrl: 'https://resend.com/mcp',
    v1LoadBearing: true,
    backingPlan: '8A-C',
  },
  {
    slug: 'vercel',
    displayName: 'Vercel',
    vendor: 'official',
    authModel: 'oauth_pkce',
    transport: 'http',
    iconKey: 'triangle',
    description: 'Deploy projects, manage domains, query build logs.',
    docsUrl: 'https://vercel.com/docs/agent-resources/vercel-mcp',
    v1LoadBearing: true,
    backingPlan: '8A-C',
  },
  {
    slug: 'hubspot',
    displayName: 'HubSpot',
    vendor: 'official',
    authModel: 'oauth_pkce',
    transport: 'http',
    iconKey: 'briefcase',
    description: 'CRM contacts + deals + activities + campaigns.',
    docsUrl: 'https://developers.hubspot.com/mcp',
    v1LoadBearing: false,
    backingPlan: '8A-D',
  },
  {
    slug: 'notion',
    displayName: 'Notion',
    vendor: 'eigent-toolkit',
    authModel: 'oauth_pkce',
    transport: 'stdio',
    iconKey: 'file-text',
    description: 'Read + write pages, query databases.',
    docsUrl: 'https://github.com/makenotion/notion-mcp-server',
    v1LoadBearing: false,
    backingPlan: '8A-eigent-inherited',
  },
  {
    slug: 'linear',
    displayName: 'Linear',
    vendor: 'official',
    authModel: 'oauth_pkce',
    transport: 'http',
    iconKey: 'kanban',
    description: 'Manage issues, projects, cycles for engineering PM.',
    docsUrl: 'https://linear.app/docs/mcp',
    v1LoadBearing: false,
    backingPlan: '8A-D',
  },
  {
    slug: 'cloudflare',
    displayName: 'Cloudflare',
    vendor: 'official',
    authModel: 'oauth_pkce',
    transport: 'http',
    iconKey: 'cloud',
    description: 'Register domains, manage DNS, deploy Workers + R2.',
    docsUrl:
      'https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/',
    v1LoadBearing: false,
    backingPlan: '8A-D',
  },
  {
    slug: 'figma',
    displayName: 'Figma',
    vendor: 'official',
    authModel: 'oauth_token_header',
    transport: 'http',
    iconKey: 'figma',
    description:
      'Read Dev Mode designs + tokens for FE implementation.',
    docsUrl: 'https://help.figma.com/hc/en-us/articles/32132100833559',
    v1LoadBearing: false,
    backingPlan: '8A-D',
  },
  {
    slug: 'posthog',
    displayName: 'PostHog',
    vendor: 'official',
    authModel: 'api_key',
    transport: 'http',
    iconKey: 'activity',
    description: 'Query product analytics + manage feature flags.',
    docsUrl: 'https://posthog.com/docs/ai/mcp',
    v1LoadBearing: false,
    backingPlan: '8A-D',
  },
  {
    slug: 'agentphone',
    displayName: 'AgentPhone',
    vendor: 'official',
    authModel: 'api_key',
    transport: 'stdio',
    iconKey: 'phone',
    description: 'Place outbound calls + receive inbound for AI agents.',
    docsUrl: 'https://agentphone.io/docs/mcp',
    v1LoadBearing: false,
    backingPlan: '8A-D',
  },
  {
    slug: 'langsmith',
    displayName: 'LangSmith',
    vendor: 'official',
    authModel: 'api_key',
    transport: 'http',
    iconKey: 'chart-line',
    description: 'Trace + evaluate + monitor agent runs.',
    docsUrl: 'https://docs.smith.langchain.com/mcp',
    v1LoadBearing: false,
    backingPlan: '8A-D',
  },
];
