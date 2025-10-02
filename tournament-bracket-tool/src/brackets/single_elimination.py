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
        return matchups

    def generate_bracket(self):
        participants = self.participants.copy()
        num_players = len(participants)
        # Find next power of 2 >= num_players
        next_pow2 = 1
        while next_pow2 < num_players:
            next_pow2 *= 2
        num_rounds = int(math.log2(next_pow2))
        # Calculate byes (teams that start in round 2)
        num_byes = next_pow2 - num_players
        # Assign byes: first num_byes teams get a bye to round 2
        round1_participants = participants[num_byes:]
        byes = participants[:num_byes]
        rounds = []
        # Round 1
        round1 = []
        for i in range(0, len(round1_participants) - len(round1_participants) % 2, 2):
            round1.append((round1_participants[i], round1_participants[i+1]))
        rounds.append(round1)
        # Prepare for next rounds
        prev_round_winners = [f"Winner of match {i+1}" for i in range(len(round1))] + byes
        for r in range(2, num_rounds+1):
            matches = []
            for i in range(0, len(prev_round_winners) - len(prev_round_winners) % 2, 2):
                matches.append((prev_round_winners[i], prev_round_winners[i+1]))
            # If odd, last team gets a bye to next round
            if len(prev_round_winners) % 2 == 1:
                matches.append((prev_round_winners[-1], f"Winner of round {r} match 1"))
            rounds.append(matches)
            prev_round_winners = [f"Winner of round {r} match {i+1}" for i in range(len(matches))]
        # Write to CSV
        csv_path = 'tournament-bracket-tool/rounds/single_elimination_bracket.csv'
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