export async function fetchBracketData() {
	const response = await fetch('/api/bracket');
	const data = await response.json();
	console.log('[DEBUG] Bracket data:', data);
	return data;
}
