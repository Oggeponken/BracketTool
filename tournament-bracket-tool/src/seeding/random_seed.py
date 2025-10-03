import random
def random_seed(players,team_size, group, group_size):
# Team generation and randomizier 
    print(team_size)
    if team_size != 1:
        teams = []
        random.shuffle(players)
        for i in range(0, len(players), team_size):
            team = ", ".join(players[i:i + team_size])
            teams.append(team)
        print("yes")
# If no teams, just randomized players
    else:
        teams = players[:]

    random.shuffle(teams)

    if group:
        grouped_teams = []
        for i in range(0, len(teams), group_size):
            group = teams[i:i + group_size]
            grouped_teams.append(group)
        teams = grouped_teams
  
    return teams