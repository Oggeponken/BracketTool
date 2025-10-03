

# --- Flask backend for bracket visualizer ---
from flask import Flask, request, render_template
import os
import subprocess
import csv

app = Flask(__name__, template_folder=os.path.join('static', 'templates'), static_folder='static')

def get_csv_path():
    # Use relative path for cross-platform compatibility
    return os.path.join(os.path.dirname(__file__), '..', 'Backend', 'rounds', 'single_elimination_bracket.csv')

@app.route('/')
def index():
    return render_template('start.html')

@app.route('/new_settings')
def new_settings():
    return render_template('new_settings.html')

@app.route('/view_bracket')
def view_bracket():
    return render_template('bracket.html')

@app.route('/save_settings', methods=['POST'])
def save_settings():
    data = request.get_json()
    settings_path = os.path.join(os.path.dirname(__file__), '..', 'Backend', 'rounds', 'settings.txt')
    with open(settings_path, 'w') as f:
        f.write(f"bracket_type={data.get('bracketType','single_elimination')}\n")
        f.write(f"team_size={data.get('teamSize','1')}\n")
        f.write(f"group_size={data.get('groupSize','4')}\n")
        f.write(f"names={','.join(data.get('players', []))}\n")
    script_path = os.path.join(os.path.dirname(__file__), '..', 'Backend', 'scripts', 'Bracket_Generation.py')
    try:
        subprocess.run(['python', script_path], check=True)
        return ('', 204)
    except Exception as e:
        return f"Error generating bracket: {e}", 500

@app.route('/load_csv', methods=['POST'])
def load_csv():
    return render_template('bracket.html')

@app.route('/api/bracket', methods=['GET'])
def get_bracket():
    csv_path = get_csv_path()
    print(f"[DEBUG] Fetching bracket from: {csv_path}")
    rounds = {}
    try:
        with open(csv_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                print(f"[DEBUG] Row: {row}")
                r = int(row['Round'])
                if r not in rounds:
                    rounds[r] = []
                match = {
                    'match': int(row['Match']),
                    'team1': row['Team 1'],
                    'team2': row['Team 2'],
                    'outcome': row.get('Outcome', '')
                }
                rounds[r].append(match)
        rounds_list = [rounds[r] for r in sorted(rounds.keys())]
        print(f"[DEBUG] Rounds list: {rounds_list}")
        return {'rounds': rounds_list}
    except Exception as e:
        print(f"[ERROR] {e}")
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

