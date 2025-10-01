# Tournament Bracket Tool

This project is a flexible tournament generation bracket tool that allows users to create various types of tournament brackets based on participant names loaded from a text file. The tool supports multiple bracket types, including single elimination, double elimination, and round robin formats.

## Project Structure

```
tournament-bracket-tool
├── src
│   ├── main.py                # Entry point of the application
│   ├── brackets               # Contains different bracket types
│   │   ├── __init__.py       # Initializes the brackets module
│   │   ├── single_elimination.py  # Logic for single elimination bracket
│   │   ├── double_elimination.py  # Logic for double elimination bracket
│   │   └── round_robin.py    # Logic for round robin bracket
│   ├── input                  # Handles input operations
│   │   ├── __init__.py       # Initializes the input module
│   │   └── names_loader.py    # Loads names from names.txt
│   └── utils                  # Contains utility functions
│       ├── __init__.py       # Initializes the utils module
│       └── helpers.py         # Utility functions for various tasks
├── requirements.txt           # Project dependencies
├── README.md                  # Project documentation
└── names.txt                  # List of participant names
```

## Setup Instructions

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the required dependencies by running:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Add participant names to the `names.txt` file, with one name per line.
2. Run the application using:
   ```
   python src/main.py
   ```
3. Follow the prompts to select the bracket type and generate the tournament bracket.

## Bracket Types

- **Single Elimination**: A knockout tournament where participants are eliminated after a single loss.
- **Double Elimination**: A tournament where participants are eliminated after two losses.
- **Round Robin**: Each participant competes against every other participant.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.