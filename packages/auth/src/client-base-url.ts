export function resolveAuthClientBaseURL(
	apiUrl = process.env.NEXT_PUBLIC_API_URL,
	pageOrigin = globalThis.window?.location.origin,
): string | undefined {
	return apiUrl || pageOrigin;
}
