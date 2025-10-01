import os

def create_settings_file(path):
    print("Creating a new settings.txt file...")
    bracket_types = {
        "1": "single_elimination",
        "2": "double_elimination",
        "3": "round_robin"
    }
    print("Select bracket type:")
    print("1. Single Elimination")
    print("2. Double Elimination")
    print("3. Round Robin")
    bracket_choice = input("Enter the number of your choice: ")
    bracket_type = bracket_types.get(bracket_choice, "single_elimination")

    team_size = input("Enter team size (default 1): ")
    team_size = team_size if team_size.isdigit() and int(team_size) > 0 else "1"

    print("Enter player names (comma separated):")
    names = input()
    with open(path, "w") as f:
        f.write(f"bracket_type={bracket_type}\n")
        f.write(f"team_size={team_size}\n")
        f.write(f"names={names}\n")
    print(f"settings.txt created at {path}")

def load_settings(path):
    settings = {}
    with open(path, "r") as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                settings[key] = value
    return settings