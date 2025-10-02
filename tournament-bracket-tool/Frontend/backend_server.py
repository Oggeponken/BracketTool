
# --- Flask backend for bracket visualizer ---
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import csv
import os

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Backend', 'rounds', 'single_elimination_bracket.csv'))

@app.route('/api/set_winner', methods=['POST'])
def set_winner():
    data = request.json
    # data = {round, match, winner}
    try:
        # Read all rows
        rows = []
        with open(CSV_PATH, newline='') as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader)
            for row in reader:
                rows.append(row)
        # Find the current match row
        for row in rows:
            if int(row[0]) == data['round']+1 and int(row[1]) == data['match']+1:
                # winner: 0 for team1, 1 for team2
                winner_name = row[3] if data['winner'] == 0 else row[4]
                row[5] = winner_name  # Set outcome
                # Propagate to next match
                next_match_num = row[2]
                # Find next match row
                for next_row in rows:
                    if next_row[0] == str(int(row[0])+1) and next_row[1] == str(next_match_num):
                        if data['winner'] == 0:
                            next_row[3] = winner_name
                        else:
                            next_row[4] = winner_name
                        break
        # Write back
        with open(CSV_PATH, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(header)
            for row in rows:
                writer.writerow(row)
        return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Flask backend for bracket visualizer ---
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import csv
import os

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Backend', 'rounds', 'single_elimination_bracket.csv'))

@app.route('/api/bracket', methods=['GET'])
def get_bracket():
    rounds = {}
    try:
        with open(CSV_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                r = int(row['Round'])
                if r not in rounds:
                    rounds[r] = []
                match = {
                    'match': int(row['Match']),
                    'team1': row['Team 1'],
                    'team2': row['Team 2'],
                    'outcome': row.get('Outcome', ''),
                    'next': row.get('Next', '')
                }
                rounds[r].append(match)
        # Convert to list of rounds for frontend
        rounds_list = [rounds[r] for r in sorted(rounds.keys())]
        return jsonify({'rounds': rounds_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update', methods=['POST'])
def update_bracket():
    data = request.json
    # data = {round, match, team, value}
    try:
        # Read all rows
        rows = []
        with open(CSV_PATH, newline='') as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader)
            for row in reader:
                rows.append(row)
        # Update the correct cell
        for row in rows:
            if int(row[0]) == data['round']+1 and int(row[1]) == data['match']+1:
                # team: 0 for team1, 1 for team2, 2 for outcome
                if data['team'] == 2:
                    row[5] = data['value']
                elif data['team'] == 0:
                    row[3] = data['value']
                elif data['team'] == 1:
                    row[4] = data['value']
        # Write back
        with open(CSV_PATH, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(header)
            for row in rows:
                writer.writerow(row)
        return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
