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
    def generate_bracket(self):
        # Ensure teams are seeded into groups
        if not self.groups:
            self.seed_teams()
        csv_path = 'tournament-bracket-tool/rounds/group_play_bracket.csv'
        with open(csv_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Round', 'Group', 'Match', 'Team 1', 'Team 2', 'Outcome'])
            match_id = 1
            # For each group, create round-robin matches
            for g_idx, group in enumerate(self.groups, 1):
                num_rounds = len(group) - 1 if len(group) > 1 else 1
                # Generate all matchups for the group
                matches = []
                for i in range(len(group)):
                    for j in range(i+1, len(group)):
                        matches.append((group[i], group[j]))
                # Write each match as a row with empty outcome
                for r in range(1, num_rounds+1):
                    for m_idx, match in enumerate(matches, 1):
                        writer.writerow([r, g_idx, m_idx, match[0], match[1], ''])
        print(f"Group play bracket CSV written to {csv_path}")

    def display_bracket(self):
        import pandas as pd
        # Skip the first 4 rows (metadata + blank line)
        df = pd.read_csv('tournament-bracket-tool/rounds/group_play_bracket.csv', skiprows=4)
        print(df)