// Team interaction logic for bracket games
export function highlightTeam(teamDiv) {
    teamDiv.classList.add('highlighted');
}

export function setTeamNameNextRound(data, roundIdx, matchIdx, teamIdx, matchDivs) {
    // Find next match using next_match mapping
    const matchInfo = data.rounds[roundIdx][matchIdx];
    let nextMatchIdx = matchInfo.next_match;
    if (nextMatchIdx && !isNaN(nextMatchIdx)) {
        nextMatchIdx = parseInt(nextMatchIdx) - 1;
        if (data.rounds[roundIdx+1] && data.rounds[roundIdx+1][nextMatchIdx]) {
            const nextMatch = data.rounds[roundIdx+1][nextMatchIdx];
            const teamName = data.rounds[roundIdx][matchIdx][teamIdx === 0 ? 'team1' : 'team2'];
            let filled = false;
            // Try to fill first available slot
            if (!nextMatch.team1 || nextMatch.team1.trim() === '') {
                nextMatch.team1 = teamName;
                filled = true;
            } else if (!nextMatch.team2 || nextMatch.team2.trim() === '') {
                nextMatch.team2 = teamName;
                filled = true;
            } else {
                // Overwrite team1 if both are filled
                nextMatch.team1 = teamName;
            }
            // Update DOM
            const nextMatchDiv = matchDivs[roundIdx+1][nextMatchIdx];
            if (nextMatchDiv) {
                const teamBoxes = nextMatchDiv.querySelectorAll('.team-box');
                if (!nextMatch.team1 || nextMatch.team1.trim() === '') {
                    if (teamBoxes[0]) teamBoxes[0].innerText = teamName;
                } else if (!nextMatch.team2 || nextMatch.team2.trim() === '') {
                    if (teamBoxes[1]) teamBoxes[1].innerText = teamName;
                } else {
                    if (teamBoxes[0]) teamBoxes[0].innerText = teamName;
                }
            }
        }
    }

    // Highlight the selected team green and the other team red in the current match
    const matchDiv = matchDivs[roundIdx][matchIdx];
    if (matchDiv) {
        const teamBoxes = matchDiv.querySelectorAll('.team-box');
            if (teamBoxes[teamIdx]) {
                teamBoxes[teamIdx].style.background = 'linear-gradient(90deg, rgba(56, 239, 125, 0.75) 0%, rgba(17, 153, 142, 0.75) 100%)'; // green gradient
            }
            if (teamBoxes[1 - teamIdx]) {
                teamBoxes[1 - teamIdx].style.background = 'linear-gradient(90deg, rgba(255, 81, 47, 0.75) 0%, rgba(221, 36, 118, 0.75) 100%)'; // red gradient
        }
    }
}

export function editTeamName(teamDiv, data, roundIdx, matchIdx, teamIdx, matchDivs, saveCallback) {
    const currentName = teamDiv.innerText;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'team-edit-input';
    teamDiv.innerText = '';
    teamDiv.appendChild(input);
    input.focus();
    input.addEventListener('blur', () => {
        const newName = input.value;
        teamDiv.innerText = newName;
        data.rounds[roundIdx][matchIdx][teamIdx === 0 ? 'team1' : 'team2'] = newName;
        if (saveCallback) saveCallback(data);
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}
