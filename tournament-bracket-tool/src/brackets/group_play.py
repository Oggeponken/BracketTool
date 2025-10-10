import csv
import math
import pandas as pd
class GroupPlay:
    def __init__(self, participants, seed, team_size, group_size):
        self.participants = participants
        self.groups = []
        self.seed = seed
        self.team_size = team_size
        self.group_size = group_size
        self.group = True

    def seed_teams(self):
        if self.seed == "random":
            from seeding.random_seed import random_seed
            self.groups = random_seed(self.participants, self.team_size,self.group, self.group_size)
        else:
            # Simple grouping if not random
            self.groups = [self.participants[i:i+self.group_size] for i in range(0, len(self.participants), self.group_size)]

    def generate_group_matchups(self):
        if not self.groups:
            self.seed_teams()
        group_matchups = []
        for g_idx, group in enumerate(self.groups, 1):
            matches = []
            for i in range(len(group)):
                for j in range(i+1, len(group)):
                    matches.append((group[i], group[j]))
            group_matchups.append((g_idx, matches))
        return group_matchups
    def generate_bracket(self, n_advance=2):
        # Ensure teams are seeded into groups
        if not self.groups:
            self.seed_teams()
        csv_path = 'tournament-bracket-tool/Backend/rounds/bracket.csv'
        all_rounds = []
        # Round 1: group play
        round1 = []
        for g_idx, group in enumerate(self.groups, 1):
            matches = []
            for i in range(len(group)):
                for j in range(i+1, len(group)):
                    matches.append((group[i], group[j]))
            for m_idx, match in enumerate(matches, 1):
                round1.append({'Type': 'group_play', 'Round': 1, 'Group': g_idx, 'Match': m_idx, 'Team 1': match[0], 'Team 2': match[1], 'Next Match': '', 'Outcome': ''})
        all_rounds.append(round1)

        # Advancing teams for knockout bracket
        advancing = []
        for g_idx in range(1, len(self.groups)+1):
            for i in range(n_advance):
                advancing.append({'group': g_idx, 'team': ''})

        # Build knockout bracket rounds
        from .single_elimination import SingleElimination
        se = SingleElimination([a['team'] for a in advancing], seed=None, team_size=1)
        participants = se.participants.copy()
        num_players = len(participants)
        rounds = []
        def next_lower_power_of_two(n):
            return 2 ** (n.bit_length() - 1)
        pow2 = next_lower_power_of_two(num_players)
        num_first_round_matches = num_players - pow2
        # First round
        round2 = []
        used = 0
        for i in range(num_first_round_matches):
            round2.append({'Type': 'group_play', 'Round': 2, 'Group': '', 'Match': i+1, 'Team 1': '', 'Team 2': '', 'Next Match': '', 'Outcome': ''})
            used += 2
        rounds.append(round2)
        # Second round and onward
        round3 = []
        byes = participants[used:]
        winners = ['' for i in range(num_first_round_matches)]
        round2_teams = byes + winners
        for i in range(0, len(round2_teams), 2):
            round3.append({'Type': 'group_play', 'Round': 3, 'Group': '', 'Match': i//2+1, 'Team 1': '', 'Team 2': '', 'Next Match': '', 'Outcome': ''})
        rounds.append(round3)
        # Continue rounds until final
        current_teams = ['' for i in range(len(round3))]
        round_num = 4
        while len(current_teams) > 1:
            next_round = []
            for i in range(0, len(current_teams), 2):
                next_round.append({'Type': 'group_play', 'Round': round_num, 'Group': '', 'Match': i//2+1, 'Team 1': '', 'Team 2': '', 'Next Match': '', 'Outcome': ''})
            rounds.append(next_round)
            current_teams = ['' for i in range(len(next_round))]
            round_num += 1
        # Combine all rounds
        all_rounds.extend(rounds)

        # Call next_match_mapping for group_play
        from seeding.next_match import next_match_mapping
        next_match = next_match_mapping(all_rounds, mode='group_play', n_advance=n_advance, num_groups=len(self.groups))

        # Write to bracket.csv
        with open(csv_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Type','Round','Group','Match','Team 1','Team 2','Next Match','Outcome'])
            for r, round_matches in enumerate(all_rounds):
                for m, match in enumerate(round_matches):
                    nm = next_match[r][m] if r < len(next_match) and m < len(next_match[r]) else ''
                    writer.writerow([match['Type'], match['Round'], match['Group'], match['Match'], match['Team 1'], match['Team 2'], nm, match['Outcome']])
        print(f"Bracket CSV written to {csv_path}")

    def get_advancing_teams(self, n_advance):
        """
        After all matches are played, determine n_advance teams from each group based on number of wins.
        Assumes the CSV has been updated with outcomes ('Team 1', 'Team 2', 'Outcome').
        """
        csv_path = 'tournament-bracket-tool/Backend/rounds/group_play_bracket.csv'
        df = pd.read_csv(csv_path)
        advancing = {}
        for g_idx in df['Group'].unique():
            group_df = df[df['Group'] == g_idx]
            win_count = {}
            for _, row in group_df.iterrows():
                if row['Outcome'] == row['Team 1']:
                    win_count[row['Team 1']] = win_count.get(row['Team 1'], 0) + 1
                elif row['Outcome'] == row['Team 2']:
                    win_count[row['Team 2']] = win_count.get(row['Team 2'], 0) + 1
            # Sort by wins, take top n_advance
            sorted_teams = sorted(win_count.items(), key=lambda x: x[1], reverse=True)
            advancing[g_idx] = [team for team, wins in sorted_teams[:n_advance]]
        return advancing

    def display_bracket(self):
        import pandas as pd
        # Skip the first 4 rows (metadata + blank line)
        df = pd.read_csv('tournament-bracket-tool/Backend/rounds/group_play_bracket.csv', skiprows=4)
        print(df)