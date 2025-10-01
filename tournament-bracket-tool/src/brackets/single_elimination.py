class SingleElimination:
    def __init__(self, participants,seed,team_size=1):
        self.participants = participants
        self.bracket = []
        self.seed = seed
        self.team_size = team_size

    def seed_teams(self):
        # Seed teams based on their order in the participants list
        if self.seed == "random":
            from seeding.random_seed import random_seed
            self.participants = random_seed(self.participants)
        self.bracket = [(self.participants[i], self.participants[len(self.participants) - 1 - i]) 
                        for i in range(len(self.participants) // 2)]

    def generate_matchups(self):
        if not self.bracket:
            self.seed_teams()
        matchups = []
        for match in self.bracket:
            matchups.append(f"{match[0]} vs {match[1]}")
        return matchups

    def display_bracket(self):
        matchups = self.generate_matchups()
        for matchup in matchups:
            print(matchup)