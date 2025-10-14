// Remove static import, use dynamic imports for gameplay types

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
	if (data.type === 'single_elimination') {
		import('./gameplays/single_elimination.js').then(mod => {
			mod.renderSingleElimination(data, bracketDiv);
		});
	} else if (data.type === 'double_elimination') {
		import('./gameplays/double_elimination.js').then(mod => {
			mod.renderDoubleElimination(data, bracketDiv);
		});
	} else if (data.type === 'group_play') {
		import('./gameplays/group_play.js').then(mod => {
			mod.renderGroupPlay(data, bracketDiv);
			
		});
	} else if (data.type === 'round_robin') {
		import('./gameplays/round_robin.js').then(mod => {
			mod.renderRoundRobin(data, bracketDiv);
		
			

		});
	} else {
		bracketDiv.innerText = 'Unknown bracket type.';
		console.error('Unknown bracket type:', data.type);
	}
});
