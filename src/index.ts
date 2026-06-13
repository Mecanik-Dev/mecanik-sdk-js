/**
 * @mecanik-dev/api - official TypeScript/JavaScript client for the Mecanik API.
 *
 *   import { MecanikClient } from '@mecanik-dev/api';
 *   const mecanik = new MecanikClient({ accountId: 'YOUR_UUID', token: 'YOUR_TOKEN' });
 *   const res = await mecanik.tools.securityHeaders({ url: 'https://example.com' });
 *
 * Get your account UUID and an API token from https://members.mecanik.dev
 * (new accounts receive 100 free credits). Full docs: https://api.mecanik.dev/docs
 */

export interface MecanikOptions {
	/** Your account UUID (from the members portal). */
	accountId: string;
	/** A bearer API token (created on the Security page of the members portal). */
	token: string;
	/** Override the API base URL. Defaults to https://api.mecanik.dev */
	baseUrl?: string;
	/** Optional custom fetch implementation (e.g. for Node < 18). */
	fetch?: typeof fetch;
}

export interface ApiError {
	code: number;
	message: string;
}

export interface ApiResponse<T = unknown> {
	result: T | null;
	success: boolean;
	errors: ApiError[];
}

/** Thrown when an endpoint returns `success: false` or a non-2xx status. */
export class MecanikError extends Error {
	readonly status: number;
	readonly errors: ApiError[];
	constructor(message: string, status: number, errors: ApiError[]) {
		super(message);
		this.name = 'MecanikError';
		this.status = status;
		this.errors = errors;
	}
}

type Body = Record<string, unknown>;

export class MecanikClient {
	private readonly accountId: string;
	private readonly token: string;
	private readonly baseUrl: string;
	private readonly _fetch: typeof fetch;

	constructor(opts: MecanikOptions) {
		if (!opts?.accountId) throw new Error('MecanikClient: "accountId" is required.');
		if (!opts?.token) throw new Error('MecanikClient: "token" is required.');
		this.accountId = opts.accountId;
		this.token = opts.token;
		this.baseUrl = (opts.baseUrl || 'https://api.mecanik.dev').replace(/\/$/, '');
		this._fetch = opts.fetch || globalThis.fetch;
		if (!this._fetch) throw new Error('MecanikClient: no global fetch available. Pass a fetch implementation.');
	}

	/** Low-level request returning the full `{ result, success, errors }` envelope. */
	async raw<T = unknown>(path: string, body?: Body, method: 'GET' | 'POST' = 'POST'): Promise<ApiResponse<T>> {
		const url = `${this.baseUrl}/v1/client/${this.accountId}${path}`;
		const init: RequestInit = { method, headers: { Authorization: `Bearer ${this.token}` } };
		if (method === 'POST') {
			(init.headers as Record<string, string>)['Content-Type'] = 'application/json';
			init.body = JSON.stringify(body ?? {});
		}
		const res = await this._fetch(url, init);
		let data: ApiResponse<T>;
		try {
			data = (await res.json()) as ApiResponse<T>;
		} catch {
			throw new MecanikError(`Invalid JSON response (HTTP ${res.status}).`, res.status, []);
		}
		return data;
	}

	/** Calls an endpoint and returns just the `result`, throwing {@link MecanikError} on failure. */
	async call<T = unknown>(path: string, body?: Body, method: 'GET' | 'POST' = 'POST'): Promise<T> {
		const data = await this.raw<T>(path, body, method);
		if (!data.success) {
			const first = data.errors?.[0];
			throw new MecanikError(first?.message || 'Request failed.', first?.code || 0, data.errors || []);
		}
		return data.result as T;
	}

	// Account
	account = () => this.call('/account', undefined, 'GET');
	tokenInfo = () => this.call('/account/token', undefined, 'GET');
	credits = () => this.call<{ credits: number }>('/account/credits', undefined, 'GET');
	listTools = () => this.call('/tools', undefined, 'GET');

	// Tools
	private t = <T = unknown>(slug: string, body?: Body) => this.call<T>(`/tools/${slug}`, body);

	readonly tools = {
		// AI-Powered
		aiCodeReview: (body: Body) => this.t('ai-code-review', body),
		aiContentSummarize: (body: Body) => this.t('ai-content-summarize', body),
		aiSeoGenerate: (body: Body) => this.t('ai-seo-generate', body),
		aiTranslate: (body: Body) => this.t('ai-translate', body),
		aiChat: (body: Body) => this.t('ai-chat', body),
		aiImageGenerate: (body: Body) => this.t('ai-image-generate', body),
		aiExtract: (body: Body) => this.t('ai-extract', body),
		aiAltText: (body: Body) => this.t('ai-alt-text', body),
		aiModeration: (body: Body) => this.t('ai-moderation', body),
		// Security & Website Analysis
		securityHeaders: (body: Body) => this.t('security-headers', body),
		tlsCheck: (body: Body) => this.t('tls-check', body),
		techDetect: (body: Body) => this.t('tech-detect', body),
		seoAnalyze: (body: Body) => this.t('seo-analyze', body),
		dnsLookup: (body: Body) => this.t('dns-lookup', body),
		openapiValidate: (body: Body) => this.t('openapi-validate', body),
		subdomainFinder: (body: Body) => this.t('subdomain-finder', body),
		exposedFiles: (body: Body) => this.t('exposed-files', body),
		// Email Tools
		emailDeliverability: (body: Body) => this.t('email-deliverability', body),
		emailValidator: (body: Body) => this.t('email-validator', body),
		emailValidatorBulk: (body: Body) => this.t('email-validator-bulk', body),
		// Premium Reports
		websiteAudit: (body: Body) => this.t('website-audit', body),
		performanceAudit: (body: Body) => this.t('performance-audit', body),
		brokenLinkChecker: (body: Body) => this.t('broken-link-checker', body),
		carbonFootprint: (body: Body) => this.t('carbon-footprint', body),
		// Developer Utilities
		qrGenerate: (body: Body) => this.t('qr-generate', body),
		placeholderImage: (query: string) => this.call(`/tools/placeholder-image?${query}`, undefined, 'GET'),
		hashGenerate: (body: Body) => this.t('hash-generate', body),
		jwtDecode: (body: Body) => this.t('jwt-decode', body),
		passwordStrength: (body: Body) => this.t('password-strength', body),
		cronExplain: (body: Body) => this.t('cron-explain', body),
		tokenCounter: (body: Body) => this.t('token-counter', body),
		jsonToCode: (body: Body) => this.t('json-to-code', body),
	};
}

export default MecanikClient;
