

// Fetch bracket data from backend (same origin)
async function fetchBracket() {
    const response = await fetch('/api/bracket');
    if (!response.ok) {
        document.getElementById('bracket').innerText = 'Failed to load bracket data.';
        return { rounds: [] };
    }
    return await response.json();
}


// Render bracket left-to-right, each round as a column, with SVG lines and stylish font
function renderBracket(data) {
    const bracketDiv = document.getElementById('bracket');
    bracketDiv.innerHTML = '';
    bracketDiv.style.display = 'flex';
    bracketDiv.style.flexDirection = 'row';
    bracketDiv.style.alignItems = 'flex-start';
    bracketDiv.style.gap = '80px'; // More spacing between rounds
    bracketDiv.style.fontFamily = 'Poppins, Segoe UI, Arial, sans-serif';

    if (!data.rounds || data.rounds.length === 0) {
        bracketDiv.innerText = 'No bracket data available.';
        return;
    }

    // Store match box positions for SVG lines
    const matchPositions = [];
    const roundDivs = [];

    data.rounds.forEach((round, rIdx) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        roundDiv.style.display = 'flex';
        roundDiv.style.flexDirection = 'column';
        roundDiv.style.gap = '75px'; // More vertical spacing between matches
        roundDiv.style.position = 'relative';

        // Jet-like pattern: offset each round vertically
        if (rIdx < data.rounds.length - 1) {
            roundDiv.style.marginTop = `${rIdx * 150}px`;
        } else {
            // Center the final round
            roundDiv.style.marginTop = `${Math.max(0, (data.rounds.length-1) * 200 - 200)}px`;
            roundDiv.style.alignItems = 'center';
        }

        // Round label
        const roundLabel = document.createElement('div');
        roundLabel.className = 'round-label';
        roundLabel.innerText = `Round ${rIdx + 1}`;
        roundLabel.style.fontWeight = 'bold';
        roundLabel.style.marginTop = '10px';
        roundLabel.style.fontSize = '1.2em';
        roundLabel.style.letterSpacing = '2px';
        roundDiv.appendChild(roundLabel);

        matchPositions.push([]);

        round.forEach((match, mIdx) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            matchDiv.style.display = 'flex';
            matchDiv.style.flexDirection = 'column';
            matchDiv.style.alignItems = 'center';
            matchDiv.style.gap = '6px';
            matchDiv.style.position = 'relative';
            matchDiv.style.fontSize = '1.1em';
            matchDiv.style.fontWeight = '500';
            matchDiv.style.background = 'rgba(255,255,255,0.8)';
            matchDiv.style.borderRadius = '8px';
            matchDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
            matchDiv.style.padding = '8px 0';

            // Team 1 box
            const team1Box = document.createElement('div');
            team1Box.className = 'team-box';
            team1Box.contentEditable = false;
            team1Box.innerText = match.team1;
            team1Box.style.fontFamily = 'inherit';
            team1Box.style.fontWeight = '600';
            team1Box.style.fontSize = '1em';
            team1Box.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    // Left click: set winner and advance immediately in UI
                    highlightWinner(matchDiv, team1Box, team2Box, 0);
                    advanceWinner(data, rIdx, mIdx, 0, team1Box.innerText);
                    setWinner(rIdx, mIdx, 0);
                } else if (e.button === 2) {
                    team1Box.contentEditable = true;
                    team1Box.focus();
                }
            });
            team1Box.addEventListener('blur', () => {
                team1Box.contentEditable = false;
                saveEdit(rIdx, mIdx, 0, team1Box.innerText);
            });
            team1Box.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            matchDiv.appendChild(team1Box);

            // VS separator (to the right)
            const vsRow = document.createElement('div');
            vsRow.style.display = 'flex';
            vsRow.style.flexDirection = 'row';
            vsRow.style.alignItems = 'center';
            vsRow.style.justifyContent = 'center';
            vsRow.style.gap = '6px';
            vsRow.style.marginTop = '2px';
            const vsSpan = document.createElement('span');
            vsSpan.innerText = 'vs';
            vsSpan.style.fontWeight = '400';
            vsSpan.style.fontSize = '0.75em';
            vsRow.appendChild(vsSpan);
            matchDiv.appendChild(vsRow);



            // Team 2 box
            const team2Box = document.createElement('div');
            team2Box.className = 'team-box';
            team2Box.contentEditable = false;
            team2Box.innerText = match.team2;
            team2Box.style.fontFamily = 'inherit';
            team2Box.style.fontWeight = '600';
            team2Box.style.fontSize = '1em';
            team2Box.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    highlightWinner(matchDiv, team1Box, team2Box, 1);
                    advanceWinner(data, rIdx, mIdx, 1, team2Box.innerText);
                    setWinner(rIdx, mIdx, 1);
                } else if (e.button === 2) {
                    team2Box.contentEditable = true;
                    team2Box.focus();
                }
            });
            team2Box.addEventListener('blur', () => {
                team2Box.contentEditable = false;
                saveEdit(rIdx, mIdx, 1, team2Box.innerText);
            });
            team2Box.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            matchDiv.appendChild(team2Box);

            
            // Highlight winner if set
            if (match.winner !== undefined) {
                highlightWinner(matchDiv, team1Box, team2Box, match.winner);
            }

            roundDiv.appendChild(matchDiv);
            matchPositions[rIdx].push(matchDiv);
        });
        roundDivs.push(roundDiv);
        bracketDiv.appendChild(roundDiv);
    });

    // Draw SVG lines between rounds, using multi-segment logic and 'next' property
    setTimeout(() => {
        for (let r = 0; r < matchPositions.length - 1; r++) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.position = 'absolute';
            svg.style.left = '0';
            svg.style.top = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            svg.setAttribute('class', 'bracket-svg');
            bracketDiv.appendChild(svg);

            matchPositions[r].forEach((fromDiv, i) => {
                const match = data.rounds[r][i];
                let nextMatchIdx = match.next !== undefined && match.next !== '' ? Number(match.next) - 1 : Math.floor(i / 2);
                if (isNaN(nextMatchIdx) || nextMatchIdx < 0) return;
                const toDiv = matchPositions[r+1][nextMatchIdx];
                if (!toDiv) return;
                const fromRect = fromDiv.getBoundingClientRect();
                const toRect = toDiv.getBoundingClientRect();
                const bracketRect = bracketDiv.getBoundingClientRect();

                // Connect from middle right edge of fromDiv to middle left edge of toDiv
                const x1 = fromRect.right*1.03 - bracketRect.left;
                const y1 = fromRect.top + fromRect.height/2;// - bracketRect.top;
                const x2 = toRect.left - bracketRect.left;
                const y2 = toRect.top + toRect.height/2;

                // Midpoint for horizontal/vertical segments
                const midX = (x1 + x2) / 2;

                // Draw polyline: right edge -> horizontal to midX -> vertical to y2 -> horizontal to left edge
                const points = [
                    [x1, y1],
                    [midX, y1],
                    [midX, y2],
                    [x2, y2]
                ];
                const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                polyline.setAttribute('points', points.map(p => p.join(',')).join(' '));
                polyline.setAttribute('fill', 'none');
                polyline.setAttribute('stroke', '#888');
                polyline.setAttribute('stroke-width', '2');
                svg.appendChild(polyline);
            });
        }
    }, 100);
// Highlight winner visually
function highlightWinner(matchDiv, team1Box, team2Box, winnerIdx) {
    if (winnerIdx === 0) {
        team1Box.style.background = '#b6fcb6';
        team2Box.style.background = '#f9f9f9';
    } else {
        team2Box.style.background = '#b6fcb6';
        team1Box.style.background = '#f9f9f9';
    }
}

// Advance winner to next round in UI
function advanceWinner(data, roundIdx, matchIdx, winnerIdx, winnerName) {
    // Only advance if not last round
    if (roundIdx < data.rounds.length - 1) {
        const match = data.rounds[roundIdx][matchIdx];
        const nextMatchIdx = match.next !== undefined ? Number(match.next) : Math.floor(matchIdx / 2);
        // By default, fill first empty slot
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
}

// Save edit to backend
async function saveEdit(round, match, team, value) {
    await fetch('/api/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({round, match, team, value})
    });
    // Optionally, re-fetch and re-render bracket
    fetchBracket().then(renderBracket);
}

// Initial load
fetchBracket().then(renderBracket);
