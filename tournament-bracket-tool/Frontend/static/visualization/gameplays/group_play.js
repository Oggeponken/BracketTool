import { drawBracketConnections } from '../drawBracketConnections.js';

export function renderGroupPlay(data, bracketDiv) {
    bracketDiv.innerHTML = '';
    if (!data.rounds || data.rounds.length === 0) {
        bracketDiv.innerText = 'No bracket data available.';
        return;
    }
    const matchDivs = [];
    data.rounds.forEach((round, rIdx) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        const roundLabel = document.createElement('div');
        roundLabel.className = 'round-label';
        roundLabel.innerText = `Round ${rIdx + 1}`;
        roundDiv.appendChild(roundLabel);
        matchDivs.push([]);
        if (rIdx === 0) {
            // Group bounding boxes for round 1
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
        } else {
            // Later rounds: single elimination drawing
            round.forEach((match, mIdx) => {
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
                roundDiv.appendChild(matchDiv);
                matchDivs[rIdx].push(matchDiv);
            });
        }
        bracketDiv.appendChild(roundDiv);
    });
    drawBracketConnections(bracketDiv, matchDivs, data);
}
