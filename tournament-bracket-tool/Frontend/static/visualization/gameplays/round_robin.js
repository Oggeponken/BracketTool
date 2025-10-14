import { drawBracketConnections } from '../drawBracketConnections.js';
import { highlightTeam, setTeamNameNextRound, editTeamName } from '../interactions/index.js';

export function renderRoundRobin(data, bracketDiv) {
    bracketDiv.innerHTML = '';
    if (!data.rounds || data.rounds.length === 0) {
        bracketDiv.innerText = 'No bracket data available.';
        return;
    }
    const matchDivs = [];
    // Configurable spacing
    const xGap = 350; // horizontal gap between rounds
    const yGap = 200;  // minimum vertical gap between matches
    const losersYGap = 100; // vertical gap between main and losers bracket
    const baseY = 40; // top margin
    let maxWidth = 0;
    let maxHeight = 0;
    
    // Create arrays to track match divs by bracket type
    const mainMatchDivs = [];
    const losersMatchDivs = [];
    
    // First pass: calculate dimensions and organize matches
    data.rounds.forEach((round, rIdx) => {
        mainMatchDivs[rIdx] = [];
        losersMatchDivs[rIdx] = [];
        
        round.forEach((match, mIdx) => {
            if (match.bracket === 'loser' || match.bracket === 'losers') {
                losersMatchDivs[rIdx].push(null); // placeholder
            } else {
                mainMatchDivs[rIdx].push(null); // placeholder
            }
        });
    });
    
    // Render main bracket
    const mainBracketDiv = document.createElement('div');
    mainBracketDiv.className = 'bracket-container main-bracket';
    mainBracketDiv.style.position = 'absolute';
    mainBracketDiv.style.top = '0';
    mainBracketDiv.style.left = '0';
    
    const mainLabel = document.createElement('div');
    mainLabel.className = 'bracket-label';
    mainLabel.innerText = 'MAIN BRACKET';
    mainLabel.style.fontWeight = 'bold';
    mainLabel.style.fontSize = '18px';
    mainLabel.style.color = '#4f8cff';
    mainLabel.style.marginBottom = '20px';
    mainLabel.style.textAlign = 'center';
    mainBracketDiv.appendChild(mainLabel);
    
    const mainContentDiv = document.createElement('div');
    mainContentDiv.className = 'bracket-content';
    mainContentDiv.style.position = 'relative';
    
    const mainDimensions = renderBracketSection(data, mainContentDiv, 'main', baseY, mainMatchDivs);
    mainBracketDiv.appendChild(mainContentDiv);
    
    // Position and style main bracket container
    mainBracketDiv.style.width = `${mainDimensions.width}px`;
    mainBracketDiv.style.height = `${mainDimensions.height}px`;
    mainBracketDiv.style.border = '3px solid #4f8cff';
    mainBracketDiv.style.borderRadius = '10px';
    mainBracketDiv.style.padding = '20px';
    mainBracketDiv.style.backgroundColor = 'rgba(79, 140, 255, 0.1)';
    mainBracketDiv.style.boxSizing = 'border-box';
    
    // Render losers bracket
    const losersBracketDiv = document.createElement('div');
    losersBracketDiv.className = 'bracket-container losers-bracket';
    losersBracketDiv.style.position = 'absolute';
    losersBracketDiv.style.top = `${mainDimensions.height + losersYGap}px`;
    losersBracketDiv.style.left = '0';
    
    const losersLabel = document.createElement('div');
    losersLabel.className = 'bracket-label';
    losersLabel.innerText = 'LOSERS BRACKET';
    losersLabel.style.fontWeight = 'bold';
    losersLabel.style.fontSize = '18px';
    losersLabel.style.color = '#ff4444';
    losersLabel.style.marginBottom = '20px';
    losersLabel.style.textAlign = 'center';
    losersBracketDiv.appendChild(losersLabel);
    
    const losersContentDiv = document.createElement('div');
    losersContentDiv.className = 'bracket-content';
    losersContentDiv.style.position = 'relative';
    
    const losersDimensions = renderBracketSection(data, losersContentDiv, 'loser', baseY, losersMatchDivs);
    losersBracketDiv.appendChild(losersContentDiv);
    
    // Position and style losers bracket container
    losersBracketDiv.style.width = `${losersDimensions.width}px`;
    losersBracketDiv.style.height = `${losersDimensions.height}px`;
    losersBracketDiv.style.border = '3px solid #ff4444';
    losersBracketDiv.style.borderRadius = '10px';
    losersBracketDiv.style.padding = '20px';
    losersBracketDiv.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
    losersBracketDiv.style.boxSizing = 'border-box';
    
    // Add both brackets to main container
    bracketDiv.appendChild(mainBracketDiv);
    bracketDiv.appendChild(losersBracketDiv);
    
    // Calculate overall dimensions
    maxWidth = Math.max(mainDimensions.width, losersDimensions.width);
    maxHeight = mainDimensions.height + losersYGap + losersDimensions.height;
    
    bracketDiv.style.position = 'relative';
    bracketDiv.style.width = `${maxWidth}px`;
    bracketDiv.style.height = `${maxHeight}px`;
    
    // Combine match divs for connection drawing (main first, then losers)
    data.rounds.forEach((round, rIdx) => {
        matchDivs[rIdx] = [...mainMatchDivs[rIdx], ...losersMatchDivs[rIdx]].filter(div => div !== null);
    });
    
    // Draw connections after all matches are rendered
    drawBracketConnections(bracketDiv, matchDivs, data);

    function renderBracketSection(data, container, bracketType, startY, targetMatchDivs) {
        let currentMaxY = startY;
        let currentMaxX = 0;
        
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
            
            // Filter matches for this bracket type
            const bracketMatches = round.filter(match => 
                (bracketType === 'loser') ? 
                (match.bracket === 'loser' || match.bracket === 'losers') : 
                (match.bracket !== 'loser' && match.bracket !== 'losers')
            );
            
            if (bracketMatches.length === 0) {
                // Create empty placeholder to maintain round structure
                const emptyDiv = document.createElement('div');
                emptyDiv.style.width = '200px';
                emptyDiv.style.height = '1px';
                roundDiv.appendChild(emptyDiv);
                container.appendChild(roundDiv);
                currentMaxX = Math.max(currentMaxX, (rIdx + 1) * xGap);
                return;
            }
            
            const numMatches = bracketMatches.length;
            const totalHeight = Math.max(numMatches * yGap, Math.pow(2, data.rounds.length - 1) * yGap);
            
            bracketMatches.forEach((match, matchIndexInBracket) => {
                // Find the original mIdx in the round
                const originalMIdx = round.findIndex(m => m === match);
                
                const matchDiv = createMatchElement(match, rIdx, originalMIdx, bracketType);
                matchDiv.style.position = 'absolute';
                
                const matchHeight = totalHeight / numMatches;
                const y = startY + matchIndexInBracket * matchHeight + (matchHeight - yGap) / 2;
                matchDiv.style.top = `${y}px`;
                matchDiv.style.left = '0';
                
                addMatchInteractions(matchDiv, data, rIdx, originalMIdx, targetMatchDivs, saveBracketData);
                
                roundDiv.appendChild(matchDiv);
                
                // Store in the correct position in targetMatchDivs
                if (targetMatchDivs[rIdx] && originalMIdx < targetMatchDivs[rIdx].length) {
                    targetMatchDivs[rIdx][originalMIdx] = matchDiv;
                }
                
                currentMaxY = Math.max(currentMaxY, y + yGap);
            });
            
            container.appendChild(roundDiv);
            currentMaxX = Math.max(currentMaxX, (rIdx + 1) * xGap);
        });
        
        // Set container dimensions
        container.style.width = `${currentMaxX}px`;
        container.style.height = `${currentMaxY}px`;
        
        return {
            width: currentMaxX + 40, // Add padding
            height: currentMaxY + 40  // Add padding
        };
    }
    
    // Helper function to create match elements
    function createMatchElement(match, rIdx, mIdx, bracketType) {
        const matchDiv = document.createElement('div');
        const matchLabel = document.createElement('div');
        matchLabel.className = 'match-label';
        
        // Different labeling for losers bracket
        if (bracketType === 'loser') {
            matchLabel.innerText = `Match ${mIdx + 1}`;
        } else {
            if (rIdx === data.rounds.length - 1) {
                matchLabel.innerText = `Final`;
            } else if (rIdx === data.rounds.length - 2) {
                matchLabel.innerText = `Semi-Final ${mIdx + 1}`;
            } else {
                matchLabel.innerText = `Match ${mIdx + 1}`;
            }
        }
        
        matchDiv.appendChild(matchLabel);
        
        matchDiv.className = 'match';
        matchDiv.style.position = 'relative';
        matchDiv.style.width = '200px';
        matchDiv.style.border = '1px solid #ccc';
        matchDiv.style.backgroundColor = 'white';
        matchDiv.style.padding = '10px';
        matchDiv.style.borderRadius = '5px';
        
        const team1Box = document.createElement('div');
        team1Box.className = 'team-box';
        team1Box.innerText = match.team1;
        team1Box.style.padding = '5px';
        team1Box.style.margin = '2px 0';
        team1Box.style.backgroundColor = '#f8f9fa';
        matchDiv.appendChild(team1Box);
        
        const vsSpan = document.createElement('div');
        vsSpan.className = 'vs-span';
        vsSpan.innerText = 'vs';
        vsSpan.style.textAlign = 'center';
        vsSpan.style.margin = '5px 0';
        vsSpan.style.fontWeight = 'bold';
        matchDiv.appendChild(vsSpan);
        
        const team2Box = document.createElement('div');
        team2Box.className = 'team-box';
        team2Box.innerText = match.team2;
        team2Box.style.padding = '5px';
        team2Box.style.margin = '2px 0';
        team2Box.style.backgroundColor = '#f8f9fa';
        matchDiv.appendChild(team2Box);
        
        return matchDiv;
    }
    
    // Helper function to add interactions to matches
    function addMatchInteractions(matchDiv, data, rIdx, mIdx, matchDivs, saveBracketData) {
        const team1Box = matchDiv.querySelector('.team-box:nth-child(2)'); // Skip match label
        const team2Box = matchDiv.querySelector('.team-box:nth-child(4)'); // Skip vs span
        
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
    }

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