def format_names(names):
    return [name.strip().title() for name in names if name.strip()]

def validate_names(names):
    if not names:
        raise ValueError("The list of names cannot be empty.")
    if any(not isinstance(name, str) or not name.strip() for name in names):
        raise ValueError("All names must be non-empty strings.")

def print_bracket(bracket):
    for match in bracket:
        print(f"{match[0]} vs {match[1]}")