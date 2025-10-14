import csv
import math
import pandas as pd

class RoundRobin:
    def __init__(self, participants, seed, team_size, n_winners, losers_bracket):
        self.participants = participants
        self.groups = []
        self.seed = seed
        self.team_size = team_size
        self.group_size = len(participants)  # All in one group
        self.group = True
        self.n_winners = n_winners
        self.losers_bracket = losers_bracket

    def seed_teams(self):
        if self.seed == "random":
            from seeding.random_seed import random_seed
            self.groups = random_seed(self.participants, self.team_size, self.group, self.group_size)
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

    def _create_match(self, match_type, bracket, round_num, group, match_num, team1="", team2=""):
        """Helper function to create a match dictionary"""
        return {
            'Type': match_type,
            'Bracket': bracket,
            'Round': round_num,
            'Group': group,
            'Match': match_num,
            'Team 1': team1,
            'Team 2': team2,
            'Next Match': '',
            'Outcome': ''
        }

    def _create_round_matches(self, match_type, bracket, round_num, num_matches, team1="", team2=""):
        """Helper function to create multiple matches for a round"""
        return [self._create_match(match_type, bracket, round_num, '', i+1, team1, team2) 
                for i in range(num_matches)]

    def _generate_round_robin_matches(self):
        """Generate all round robin matches for groups"""
        matches = []
        for g_idx, group in enumerate(self.groups, 1):
            group_matches = []
            for i in range(len(group)):
                for j in range(i+1, len(group)):
                    group_matches.append((group[i], group[j]))
            for m_idx, match in enumerate(group_matches, 1):
                matches.append(self._create_match('round_robin', 'main', 1, g_idx, m_idx, match[0], match[1]))
        return matches

    def _generate_main_bracket(self):
        """Generate the main bracket rounds"""
        rounds = []
        
        # Round 1: Round robin group play
        rounds.append(self._generate_round_robin_matches())
   
        # From round 2 onwards: elimination rounds
        round = 2
        while True:
            if self.losers_bracket and round > 2:
                participants = self.n_winners - round + 2 + 1
            else:
                participants = self.n_winners - round + 2
            if participants <= 2 and not self.losers_bracket:
                rounds.append(self._create_round_matches('round_robin', 'main', round, 1))
                break
            else:
                rounds.append(self._create_round_matches('round_robin', 'main', round, 1))
                rounds.append(self._create_round_matches('round_robin', 'main', round+1, 1))
                break

            num_round_matches = 0
            for k in range(1,participants+1):
                if self.losers_bracket:
                    num_round_matches += k - 1
                else:
                    num_round_matches += k
            rounds.append(self._create_round_matches('round_robin', 'main', round, num_round_matches))
            round += 1
         
                

        return rounds

    def _generate_losers_bracket(self):
        rounds = []
   
        # From round 2 onwards: elimination rounds
        round = 2
        while True:
            if round == 2:
                participants = int(len(self.participants)/self.team_size - self.n_winners) 
            else:
                # hardcoding that only 1 losers bracket round for now
                break

            num_round_matches = 0
            for k in range(1,participants+1):
                num_round_matches += k
            rounds.append(self._create_round_matches('round_robin', 'loser', round, num_round_matches))
            round += 1
        return rounds
    def generate_bracket(self, n_advance=2):
        """Generate the complete tournament bracket"""
        if not self.groups:
            self.seed_teams()
            
        csv_path = 'tournament-bracket-tool/Backend/rounds/bracket.csv'
        
        # Generate all rounds
        main_rounds = self._generate_main_bracket()
        losers_rounds = self._generate_losers_bracket()
        all_rounds = main_rounds + losers_rounds

        # Generate next match mapping
        from seeding.next_match import next_match_mapping
        next_match = next_match_mapping(all_rounds, mode='group_play', n_advance=n_advance, num_groups=len(self.groups))

        # Write to CSV
        self._write_bracket_to_csv(csv_path, all_rounds, next_match)
        print(f"Bracket CSV written to {csv_path}")

    def _write_bracket_to_csv(self, csv_path, all_rounds, next_match):
        """Write the bracket data to CSV file"""
        with open(csv_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Type', 'Bracket', 'Round', 'Group', 'Match', 'Team 1', 'Team 2', 'Next Match', 'Outcome'])
            
            for r, round_matches in enumerate(all_rounds):
                for m, match in enumerate(round_matches):
                    nm = next_match[r][m] if r < len(next_match) and m < len(next_match[r]) else ''
                    writer.writerow([
                        match['Type'], 
                        match['Bracket'],
                        match['Round'], 
                        match['Group'], 
                        match['Match'], 
                        match['Team 1'], 
                        match['Team 2'], 
                        nm, 
                        match['Outcome']
                    ])

    def get_advancing_teams(self, n_advance):
        """
        After all matches are played, determine n_advance teams from each group based on number of wins.
        Assumes the CSV has been updated with outcomes ('Team 1', 'Team 2', 'Outcome').
        """
        csv_path = 'tournament-bracket-tool/Backend/rounds/bracket.csv'
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
        """Display the bracket from CSV file"""
        import pandas as pd
        df = pd.read_csv('tournament-bracket-tool/Backend/rounds/bracket.csv', skiprows=4)
        print(df)