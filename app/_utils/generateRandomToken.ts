export function generateRandomToken(length: number = 32): string {
	const array = new Uint8Array(length / 2);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
