// Draw bounding boxes for matches and groups
export function renderMatchBoxes({matches, container, groupKey=null, roundIdx=0, xGap=250, yGap=200, baseY=40}) {
    // If groupKey is provided, group matches by group
    let groupMap = {};
    if (groupKey) {
        matches.forEach((match, idx) => {
            const group = match[groupKey];
            if (!groupMap[group]) groupMap[group] = [];
            groupMap[group].push(idx);
        });
    }
    // Draw group bounding boxes first
    if (groupKey && Object.keys(groupMap).length > 0) {
        Object.entries(groupMap).forEach(([group, idxs]) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group-box';
            groupDiv.style.position = 'absolute';
            groupDiv.style.left = `${roundIdx * xGap}px`;
            // Find min/max y for matches in this group
            let minY = Infinity, maxY = -Infinity;
            idxs.forEach(i => {
                const y = baseY + i * yGap;
                if (y < minY) minY = y;
                if (y + yGap > maxY) maxY = y + yGap;
            });
            groupDiv.style.top = `${minY - 10}px`;
            groupDiv.style.height = `${maxY - minY + 20}px`;
            groupDiv.style.width = '220px';
            groupDiv.style.border = '2px solid #0077cc';
            groupDiv.style.background = 'rgba(0,119,204,0.08)';
            groupDiv.innerText = `Group ${group}`;
            container.appendChild(groupDiv);
        });
    }
    // Draw individual match bounding boxes
    matches.forEach((match, mIdx) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        matchDiv.style.position = 'absolute';
        matchDiv.style.left = `${roundIdx * xGap}px`;
        matchDiv.style.top = `${baseY + mIdx * yGap}px`;
        matchDiv.style.width = '200px';
        matchDiv.style.border = '1px solid #ccc';
        container.appendChild(matchDiv);
        match._matchDiv = matchDiv; // Attach for later use
    });
}
