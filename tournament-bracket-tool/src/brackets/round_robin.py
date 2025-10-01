class RoundRobin:
    def __init__(self, participants):
        self.participants = participants
        self.matches = []

    def generate_matches(self):
        num_participants = len(self.participants)
        if num_participants < 2:
            raise ValueError("At least two participants are required for a round-robin tournament.")
        
        for i in range(num_participants):
            for j in range(i + 1, num_participants):
                self.matches.append((self.participants[i], self.participants[j]))

    def get_matches(self):
        return self.matches

    def display_matches(self):
        for match in self.matches:
            print(f"{match[0]} vs {match[1]}")