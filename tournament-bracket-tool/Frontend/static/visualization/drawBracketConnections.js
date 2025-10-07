
function drawConnection(svg, fromDiv, toDiv, bracketDiv) {
    const fromRect = fromDiv.getBoundingClientRect();
    const toRect = toDiv.getBoundingClientRect();
    const bracketRect = bracketDiv.getBoundingClientRect();
    // Offset coordinates relative to bracketDiv
    const x1 = fromRect.right - bracketRect.left;
    const y1 = fromRect.top + fromRect.height/2 - bracketRect.top;
    const x2 = toRect.left - bracketRect.left;
    const y2 = toRect.top + toRect.height/2 - bracketRect.top;
    const midX = (x1 + x2) / 2;
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
}

export function drawBracketConnections(bracketDiv, matchDivs, data) {
    setTimeout(() => {
        for (let r = 0; r < matchDivs.length - 1; r++) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.position = 'absolute';
            svg.style.left = '0';
            svg.style.top = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            svg.setAttribute('class', 'bracket-svg');
            bracketDiv.appendChild(svg);

            // Use Next Match mapping from data
            const roundData = data.rounds[r];
            for (let i = 0; i < matchDivs[r].length; i++) {
                const matchInfo = roundData[i];
                // Next Match index from CSV (should be 1-based)
                let nextMatchIdx = matchInfo.next_match;
                if (nextMatchIdx && !isNaN(nextMatchIdx)) {
                    nextMatchIdx = parseInt(nextMatchIdx) - 1;
                    if (matchDivs[r+1][nextMatchIdx]) {
                        drawConnection(svg, matchDivs[r][i], matchDivs[r+1][nextMatchIdx], bracketDiv);
                    }
                }
            }
        }
    }, 100);
}
