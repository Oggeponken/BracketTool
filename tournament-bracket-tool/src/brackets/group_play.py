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
        csv_path = 'tournament-bracket-tool/Backend/rounds/group_play_bracket.csv'
        with open(csv_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Round', 'Group', 'Match', 'Team 1', 'Team 2', 'Outcome'])
            match_id = 1
            # For each group, create round-robin matches
            for g_idx, group in enumerate(self.groups, 1):
                # Generate all matchups for the group (round-robin)
                matches = []
                for i in range(len(group)):
                    for j in range(i+1, len(group)):
                        matches.append((group[i], group[j]))
                # Write each match as a row with empty outcome
                for m_idx, match in enumerate(matches, 1):
                    writer.writerow([1, g_idx, m_idx, match[0], match[1], ''])
        print(f"Group play bracket CSV written to {csv_path}")

        # Generate dummy advancing teams for knockout bracket
        advancing = []
        for g_idx in range(1, len(self.groups)+1):
            for i in range(n_advance):
                advancing.append("")

        # Generate knockout bracket using SingleElimination class
        from .single_elimination import SingleElimination
        se = SingleElimination(advancing, seed=None, team_size=1)
        participants = se.participants.copy()
        num_players = len(participants)
        rounds = []
        def next_lower_power_of_two(n):
            return 2 ** (n.bit_length() - 1)
        pow2 = next_lower_power_of_two(num_players)
        num_first_round_matches = num_players - pow2
        # First round
        round1 = []
        used = 0
        for i in range(num_first_round_matches):
            round1.append(("", ""))
            used += 2
        rounds.append(round1)
        # Second round
        round2 = []
        byes = participants[used:]
        winners = ["" for i in range(num_first_round_matches)]
        round2_teams = byes + winners
        for i in range(0, len(round2_teams), 2):
            round2.append(("", ""))
        rounds.append(round2)
        # Continue rounds until final
        current_teams = ["" for i in range(len(round2))]
        round_num = 4
        while len(current_teams) > 1:
            next_round = []
            for i in range(0, len(current_teams), 2):
                next_round.append(("", ""))
            rounds.append(next_round)
            current_teams = ["" for i in range(len(next_round))]
            round_num += 1
        # Append knockout bracket to group_play_bracket.csv, starting round from 2
        with open(csv_path, 'a', newline='') as csvfile:
            writer = csv.writer(csvfile)
            for r, matches in enumerate(rounds, 1):
                for m, match in enumerate(matches, 1):
                    writer.writerow([r, '', m, match[0], match[1], ''])
        print(f"Knockout bracket skeleton appended to {csv_path}")

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