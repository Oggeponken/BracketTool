#  function to determine next match mapping
def next_match_mapping(rounds):
    next_match = []
    for r, matches in enumerate(rounds[:-1], 1):  # skip last round
                next_match1 = []
                next_round = rounds[r]  # r+1-th round
                next_idx = 1
                for m, match in enumerate(matches, 1):
                    # Find the next available match in next_round
                    while next_idx <= len(next_round):
                        n_team1, n_team2 = next_round[next_idx-1][0], next_round[next_idx-1][1]
                        if n_team1 == "" and n_team2 == "":
                            # Both slots empty, both current matches go to this next match
                            next_match1.append(next_idx)
                            next_match1.append(next_idx)
                            next_idx += 1
                            break
                        elif n_team1 == "" or n_team2 == "":
                            # Only one slot empty, assign one current match to this, next to next
                            next_match1.append(next_idx)
                            next_idx += 1
                            next_match1.append(next_idx)
                            next_idx += 1
                            break
                        else:
                            next_idx += 1
                            continue
                next_match.append(next_match1)
            # Initialize last round with empty next_match values
    last_round_len = len(rounds[-1])
    next_match.append([''] * last_round_len)

