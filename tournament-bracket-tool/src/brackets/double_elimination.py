class DoubleElimination:
    def __init__(self, teams):
        self.teams = teams
        self.winners_bracket = []
        self.losers_bracket = []

    def seed_teams(self):
        # Logic to seed teams into the brackets
        self.winners_bracket = self.teams.copy()
        self.losers_bracket = []

    def generate_matchups(self):
        # Logic to generate matchups for the tournament
        matchups = []
        for i in range(0, len(self.winners_bracket), 2):
            if i + 1 < len(self.winners_bracket):
                matchups.append((self.winners_bracket[i], self.winners_bracket[i + 1]))
        return matchups

    def update_losers_bracket(self, team):
        # Logic to update the losers bracket
        self.losers_bracket.append(team)

    def get_bracket(self):
        return {
            "winners_bracket": self.winners_bracket,
            "losers_bracket": self.losers_bracket
        }