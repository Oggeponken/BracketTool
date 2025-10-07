import { drawBracketConnections } from './drawBracketConnections.js';

export function renderBracket(data, bracketDiv) {
	// const type = data.type; // what type of tournament (uncomment and use if needed)
	bracketDiv.innerHTML = '';
	if (!data.rounds || data.rounds.length === 0) {
		bracketDiv.innerText = 'No bracket data available.';
		return;
	}
	const type = data.type;
	const matchDivs = [];
	if (type === 'group_play') {
		// Group play: wrap matches with same group ID in a bounding box
		const groupMap = {};
		data.rounds.forEach((round, rIdx) => {
			round.forEach((match, mIdx) => {
				const groupId = match.group;
				if (!groupMap[groupId]) groupMap[groupId] = [];
				groupMap[groupId].push({ match, rIdx, mIdx });
			});
		});
		// For each round, render groups
		data.rounds.forEach((round, rIdx) => {
			const roundDiv = document.createElement('div');
			roundDiv.className = 'round';
			const roundLabel = document.createElement('div');
			roundLabel.className = 'round-label';
			roundLabel.innerText = `Round ${rIdx + 1}`;
			roundDiv.appendChild(roundLabel);
			matchDivs.push([]);
			// Find all groups in this round
			const groupsInRound = {};
			round.forEach((match, mIdx) => {
				if (!groupsInRound[match.group]) groupsInRound[match.group] = [];
				groupsInRound[match.group].push({ match, mIdx });
			});
			Object.keys(groupsInRound).forEach(groupId => {
				const groupBox = document.createElement('div');
				groupBox.className = 'group-box';
				groupsInRound[groupId].forEach(({ match, mIdx }) => {
					const matchDiv = document.createElement('div');
					matchDiv.className = 'match';
					const team1Box = document.createElement('div');
					team1Box.className = 'team-box';
					team1Box.innerText = match.team1;
					matchDiv.appendChild(team1Box);
					const vsSpan = document.createElement('div');
					vsSpan.className = 'vs-span';
					vsSpan.innerText = 'vs';
					matchDiv.appendChild(vsSpan);
					const team2Box = document.createElement('div');
					team2Box.className = 'team-box';
					team2Box.innerText = match.team2;
					matchDiv.appendChild(team2Box);
					groupBox.appendChild(matchDiv);
					matchDivs[rIdx].push(matchDiv);
				});
				roundDiv.appendChild(groupBox);
			});
			bracketDiv.appendChild(roundDiv);
		});
		// Draw connections from each group's round 1 matches to round 2
		// (Assumes group IDs are consistent between rounds)
		setTimeout(() => {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.style.position = 'absolute';
			svg.style.left = '0';
			svg.style.top = '0';
			svg.style.width = '100%';
			svg.style.height = '100%';
			svg.style.pointerEvents = 'none';
			svg.setAttribute('class', 'bracket-svg');
			bracketDiv.appendChild(svg);
			if (data.rounds.length > 1) {
				const round1 = data.rounds[0];
				const round2 = data.rounds[1];
				const groupToMatches1 = {};
				round1.forEach((match, idx) => {
					if (!groupToMatches1[match.group]) groupToMatches1[match.group] = [];
					groupToMatches1[match.group].push(idx);
				});
				const groupToMatches2 = {};
				round2.forEach((match, idx) => {
					if (!groupToMatches2[match.group]) groupToMatches2[match.group] = [];
					groupToMatches2[match.group].push(idx);
				});
				Object.keys(groupToMatches1).forEach(groupId => {
					const fromIdxs = groupToMatches1[groupId];
					const toIdxs = groupToMatches2[groupId] || [];
					fromIdxs.forEach((fromIdx, i) => {
						const toIdx = toIdxs[i] !== undefined ? toIdxs[i] : toIdxs[0];
						if (matchDivs[0][fromIdx] && matchDivs[1][toIdx]) {
							drawBracketConnections(bracketDiv, [[matchDivs[0][fromIdx]], [matchDivs[1][toIdx]]], { rounds: [ [round1[fromIdx]], [round2[toIdx]] ] });
						}
					});
				});
			}
		}, 100);
	} else {
		// ...existing code for other types...
		const matchDivs = [];
		data.rounds.forEach((round, rIdx) => {
			const roundDiv = document.createElement('div');
			roundDiv.className = 'round';
			const roundLabel = document.createElement('div');
			roundLabel.className = 'round-label';
			roundLabel.innerText = `Round ${rIdx + 1}`;
			roundDiv.appendChild(roundLabel);
			matchDivs.push([]);
			round.forEach((match, mIdx) => {
				const matchDiv = document.createElement('div');
				matchDiv.className = 'match';
				// Top to bottom: team1, vs, team2
				const team1Box = document.createElement('div');
				team1Box.className = 'team-box';
				team1Box.innerText = match.team1;
				matchDiv.appendChild(team1Box);
				const vsSpan = document.createElement('div');
				vsSpan.className = 'vs-span';
				vsSpan.innerText = 'vs';
				matchDiv.appendChild(vsSpan);
				const team2Box = document.createElement('div');
				team2Box.className = 'team-box';
				team2Box.innerText = match.team2;
				matchDiv.appendChild(team2Box);
				roundDiv.appendChild(matchDiv);
				matchDivs[rIdx].push(matchDiv);
			});
			bracketDiv.appendChild(roundDiv);
		});
		drawBracketConnections(bracketDiv, matchDivs, data);
	}
}

function highlightWinner(matchDiv, team1Box, team2Box, winnerIdx) {
	if (winnerIdx === 0) {
		team1Box.style.background = '#b6fcb6';
		team2Box.style.background = '#f9f9f9';
	} else {
		team2Box.style.background = '#b6fcb6';
		team1Box.style.background = '#f9f9f9';
	}
}

function advanceWinner(data, roundIdx, matchIdx, winnerIdx, winnerName) {
	if (roundIdx < data.rounds.length - 1) {
		const match = data.rounds[roundIdx][matchIdx];
		const nextMatchIdx = match.next !== undefined ? Number(match.next) : Math.floor(matchIdx / 2);
		const nextMatch = data.rounds[roundIdx + 1][nextMatchIdx];
		if (nextMatch) {
			if (!nextMatch.team1 || nextMatch.team1 === "") {
				nextMatch.team1 = winnerName;
			} else {
				nextMatch.team2 = winnerName;
			}
		}
	}
}
