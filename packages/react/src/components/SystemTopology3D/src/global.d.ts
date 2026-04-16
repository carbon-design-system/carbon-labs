declare global {
	interface ImportMetaEnv {
		readonly BASE_URL?: string;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export {};

// Made with Bob
