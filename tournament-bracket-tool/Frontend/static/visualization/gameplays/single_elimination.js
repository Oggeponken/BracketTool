import { drawBracketConnections } from '../drawBracketConnections.js';
import { highlightTeam, setTeamNameNextRound, editTeamName } from '../interactions/index.js';

export function renderSingleElimination(data, bracketDiv) {
    bracketDiv.innerHTML = '';
    if (!data.rounds || data.rounds.length === 0) {
        bracketDiv.innerText = 'No bracket data available.';
        return;
    }
    const matchDivs = [];
    // Configurable spacing
    const xGap = 350; // horizontal gap between rounds
    const yGap = 200;  // minimum vertical gap between matches
    const baseY = 40; // top margin

    let maxWidth = 0;
    let maxHeight = 0;
    data.rounds.forEach((round, rIdx) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        roundDiv.style.position = 'absolute';
        roundDiv.style.left = `${rIdx * xGap}px`;
        roundDiv.style.top = '0';
        const roundLabel = document.createElement('div');
        roundLabel.className = 'round-label';
        roundLabel.innerText = `Round ${rIdx + 1}`;
        roundDiv.appendChild(roundLabel);
        matchDivs.push([]);
        const numMatches = round.length;
        // Pyramid layout: calculate vertical position for each match
        const totalHeight = Math.pow(2, data.rounds.length - 1) * yGap;
        for (let mIdx = 0; mIdx < numMatches; mIdx++) {
            const matchDiv = document.createElement('div');
            const matchLabel = document.createElement('div');
            matchLabel.className = 'match-label';
            // Correct logic for labeling rounds
            if (rIdx === data.rounds.length - 1) {
                matchLabel.innerText = `Final`;
            } else if (rIdx === data.rounds.length - 2) {
                matchLabel.innerText = `Semi-Final ${mIdx + 1}`;
            } else {
                matchLabel.innerText = `Match ${mIdx + 1}`;
            }
            matchDiv.appendChild(matchLabel);
            matchDiv.className = 'match';
            matchDiv.style.position = 'absolute';
            const matchHeight = totalHeight / numMatches;
            const y = baseY + mIdx * matchHeight + (matchHeight - yGap) / 2;
            matchDiv.style.top = `${y}px`;
            matchDiv.style.left = '0';
            matchDiv.style.width = '200px';
            //matchDiv.style.height = '80px';
            matchDiv.style.border = '1px solid #ccc';
            const team1Box = document.createElement('div');
            team1Box.className = 'team-box';
            team1Box.innerText = round[mIdx].team1;
            matchDiv.appendChild(team1Box);
            const vsSpan = document.createElement('div');
            vsSpan.className = 'vs-span';
            vsSpan.innerText = 'vs';
            matchDiv.appendChild(vsSpan);
            const team2Box = document.createElement('div');
            team2Box.className = 'team-box';
            team2Box.innerText = round[mIdx].team2;
            matchDiv.appendChild(team2Box);

            // Add interaction handlers
            [team1Box, team2Box].forEach((teamDiv, teamIdx) => {
                // Single left click: highlight
                teamDiv.addEventListener('click', (e) => {
                    if (e.detail === 1 && e.button === 0) {
                        highlightTeam(teamDiv);
                    }
                });
                // Double left click: set team name in next round
                teamDiv.addEventListener('dblclick', (e) => {
                    if (e.button === 0) {
                        setTeamNameNextRound(data, rIdx, mIdx, teamIdx, matchDivs);
                    }
                });
                // Right click: edit team name and save to backend
                teamDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    editTeamName(teamDiv, data, rIdx, mIdx, teamIdx, matchDivs, saveBracketData);
                });
            });
            roundDiv.appendChild(matchDiv);
            matchDivs[rIdx].push(matchDiv);
            // Track max height
            if (y + yGap > maxHeight) maxHeight = y + yGap;
        }
        bracketDiv.appendChild(roundDiv);
        // Track max width
        if ((rIdx + 1) * xGap > maxWidth) maxWidth = (rIdx + 1) * xGap;
    });
    // Set bounding box size to cover the entire bracket
    bracketDiv.style.position = 'relative';
    bracketDiv.style.width = `${maxWidth}px`;
    bracketDiv.style.height = `${maxHeight}px`;
    drawBracketConnections(bracketDiv, matchDivs, data);

    // Save function: POST updated bracket to backend
    function saveBracketData(updatedData) {
        fetch('/api/save_bracket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        }).then(res => {
            if (!res.ok) {
                alert('Failed to save bracket data');
            }
        });
    }
}
