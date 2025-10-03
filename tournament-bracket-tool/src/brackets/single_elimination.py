import csv
import math

class SingleElimination:
    def __init__(self, participants,seed,team_size):
        self.participants = participants
        self.bracket = []
        self.seed = seed
        self.team_size = team_size

  
    # Team generation and seeding
    def seed_teams(self):
        print("hi, inside seed_teams")
        if self.seed == "random":
            from seeding.random_seed import random_seed
            print(self.team_size)
            self.participants = random_seed(self.participants,self.team_size,False,0)
        self.bracket = [(self.participants[i], self.participants[len(self.participants) - 1 - i]) 
                        for i in range(len(self.participants) // 2)]
    # Matchup generation
    def generate_matchups(self):
        if not self.bracket:
            self.seed_teams()
        matchups = []
        for match in self.bracket:
            matchups.append(f"{match[0]} vs {match[1]}")
        print("inside generate_matchups")
        return matchups

    def generate_bracket(self):
        # Always seed teams before generating bracket
        self.seed_teams()
        participants = self.participants.copy()
        num_players = len(participants)
        rounds = []

        def next_lower_power_of_two(n):
            return 2 ** (n.bit_length() - 1)

        pow2 = next_lower_power_of_two(num_players)
        num_byes = pow2 * 2 - num_players if num_players > pow2 else 0
        num_first_round_matches = num_players - pow2

        round1 = []
        used = 0
        for i in range(num_first_round_matches):
            round1.append((participants[used], participants[used+1]))
            used += 2
        rounds.append(round1)

        round2 = []
        byes = participants[used:]
        winners = [f"" for i in range(num_first_round_matches)]
        round2_teams = byes + winners
        for i in range(0, len(round2_teams), 2):
            t1 = round2_teams[i] if i < len(round2_teams) else ""
            t2 = round2_teams[i+1] if i+1 < len(round2_teams) else ""
            round2.append((t1, t2))
        rounds.append(round2)

        current_teams = [f"" for i in range(len(round2))]
        round_num = 3
        while len(current_teams) > 1:
            next_round = []
            for i in range(0, len(current_teams), 2):
                t1 = current_teams[i] if i < len(current_teams) else ""
                t2 = current_teams[i+1] if i+1 < len(current_teams) else ""
                next_round.append((t1, t2))
            rounds.append(next_round)
            current_teams = [f"" for i in range(len(next_round))]
            round_num += 1

        csv_path = 'tournament-bracket-tool/Backend/rounds/single_elimination_bracket.csv'
        with open(csv_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Round', 'Match', 'Team 1', 'Team 2', 'Outcome'])
            for r, matches in enumerate(rounds, 1):
                for m, match in enumerate(matches, 1):
                    writer.writerow([r, m, match[0], match[1], ''])
        print(f"Bracket CSV written to {csv_path}")

    def display_bracket(self):
        matchups = self.generate_matchups()
        
        for matchup in matchups:
            print(matchup)