#  function to determine next match mapping
def next_match_mapping(rounds, mode=None, n_advance=None, num_groups=None):
    next_match = []
    if mode == 'group_play' and n_advance and num_groups:
        # For group play, map n_advance winners from each group to next round matches, avoiding same group pairs
        # Assume round 1 is group play, round 2 is knockout
        # For round 2, assign winners from different groups to different matches
        # Example: 2 advance from 4 groups -> 8 teams, 4 matches in round 2
        # Map: group1_winner1 -> match1, group2_winner1 -> match2, group3_winner1 -> match3, group4_winner1 -> match4
        #       group1_winner2 -> match4, group2_winner2 -> match3, group3_winner2 -> match2, group4_winner2 -> match1
        for r, matches in enumerate(rounds[:-1]):
            next_match1 = []
            if r == 0:
                # Map group play winners to knockout matches
                total_winners = n_advance * num_groups
                num_matches = len(rounds[1]) if len(rounds) > 1 else 1
                if num_matches == 0:
                    num_matches = 1
                for m, match in enumerate(matches):
                    group = match.get('Group', None)
                    idx = (m % num_matches) + 1
                    next_match1.append(idx)
                next_match.append(next_match1)
            else:
                # For later rounds, use default mapping (single elimination style)
                next_round = rounds[r+1] if r+1 < len(rounds) else []
                filled_slots = [[match.get('Team 1','') != '', match.get('Team 2','') != ''] for match in next_round]
                for m, match in enumerate(matches):
                    assigned = False
                    for idx, (slot1, slot2) in enumerate(filled_slots):
                        if not slot1:
                            next_match1.append(idx + 1)
                            filled_slots[idx][0] = True
                            assigned = True
                            break
                        elif not slot2:
                            next_match1.append(idx + 1)
                            filled_slots[idx][1] = True
                            assigned = True
                            break
                    if not assigned:
                        next_match1.append(1)
                next_match.append(next_match1)
        # Initialize last round with empty next_match values
        last_round_len = len(rounds[-1])
        next_match.append([''] * last_round_len)
        return next_match
    else:
        # Default: single elimination mapping
        for r, matches in enumerate(rounds[:-1], 1):  # skip last round
            next_match1 = []
            next_round = rounds[r]  # r+1-th round
            filled_slots = [[match[0] != "", match[1] != ""] for match in next_round]
            for m, match in enumerate(matches):
                assigned = False
                for idx, (slot1, slot2) in enumerate(filled_slots):
                    if not slot1:
                        next_match1.append(idx + 1)
                        filled_slots[idx][0] = True
                        assigned = True
                        break
                    elif not slot2:
                        next_match1.append(idx + 1)
                        filled_slots[idx][1] = True
                        assigned = True
                        break
                if not assigned:
                    next_match1.append(1)
            next_match.append(next_match1)
        last_round_len = len(rounds[-1])
        next_match.append([''] * last_round_len)
        return next_match
