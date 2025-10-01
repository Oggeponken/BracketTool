def load_names(file_path='names.txt'):
    try:
        with open(file_path, 'r') as file:
            names = [line.strip() for line in file if line.strip()]
        return names
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []