# main.py

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'src')))
import os
from brackets.single_elimination import SingleElimination
from brackets.double_elimination import DoubleElimination
from brackets.group_play import GroupPlay
from brackets.round_robin import RoundRobin
from settings_creator import create_settings_file, load_settings
#import pandas as pd
SETTINGS_PATH = 'tournament-bracket-tool/Backend/rounds/settings.txt'

def main():
    if not os.path.exists(SETTINGS_PATH):
        print("settings.txt not found.")
        return

    settings = load_settings(SETTINGS_PATH)
    names = [n.strip() for n in settings.get("names", "").split(",") if n.strip()]
    bracket_type = settings.get("bracket_type", "single_elimination")
    team_size = int(settings.get("team_size", "1"))
    losers_bracket = settings.get("losers_bracket", "False")
    n_winners = int(settings.get("n_winners", "2"))
    print(bracket_type)
    if not names:
        print("No names found in settings.txt.")
        return

    # Bracket selection
    if bracket_type == "single_elimination":
        bracket = SingleElimination(names, seed="random", team_size=team_size)
        print("inside single elimination")
    elif bracket_type == "double_elimination":
        bracket = DoubleElimination(names, team_size=team_size)
    elif bracket_type == "round_robin":
        bracket = RoundRobin(names, team_size=team_size, seed="random", n_winners=n_winners, losers_bracket=losers_bracket)
    elif bracket_type == "group_play":
        group_size = int(settings.get("group_size", "8"))
        seed = settings.get("seed", "random")
        
        bracket = GroupPlay(names, seed=seed, team_size=team_size, group_size=group_size)
    else:
        print("Invalid bracket type in settings.txt.")
        return

    bracket.generate_bracket()

if __name__ == "__main__":
    main()