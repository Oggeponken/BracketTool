import { renderBracket } from './renderBracket.js';

// Fetch bracket data from backend (same origin)
async function fetchBracket() {
	const response = await fetch('/api/bracket');
	if (!response.ok) {
		document.getElementById('bracket').innerText = 'Failed to load bracket data.';
		return { rounds: [] };
	}
	return await response.json();
}

// Initial load
fetchBracket().then(data => {
	const bracketDiv = document.getElementById('bracket');
	renderBracket(data, bracketDiv);
});
