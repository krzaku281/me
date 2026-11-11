// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	/** paths.base, injected by vite.config.ts (e.g. '' or '/me'). */
	const __BASE_PATH__: string;
	/** GoatCounter endpoint, or '' when analytics are off. */
	const __GOATCOUNTER__: string;
}

export {};
