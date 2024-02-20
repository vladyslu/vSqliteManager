from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DATABASE = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/tables', methods=['GET'])
def get_tables():
    conn = get_db_connection()
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    conn.close()
    return jsonify([table['name'] for table in tables])

@app.route('/table/<table_name>', methods=['GET'])
def get_table_data(table_name):
    conn = get_db_connection()
    data = conn.execute(f'SELECT * FROM {table_name}').fetchall()
    conn.close()
    return jsonify([dict(row) for row in data])


@app.route('/table/<table_name>/remove_row', methods=['POST'])
def remove_row(table_name):
    row_id = request.json['id']
    conn = get_db_connection()
    conn.execute(f'DELETE FROM {table_name} WHERE id = ?', (row_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})
    
    
    
@app.route('/table/<table_name>/remove_column', methods=['POST'])
def remove_column(table_name):
    data = request.json
    column_name = data['column_name']
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    # Fetch existing columns
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [info[1] for info in cursor.fetchall() if info[1] != column_name]
    if not columns:
        return jsonify({'error': 'Cannot remove the only column.'}), 400
    # Create a new table name
    new_table_name = f"{table_name}_new"
    # Create a new table without the column and copy data
    columns_str = ", ".join(columns)
    cursor.execute(f"CREATE TABLE {new_table_name} AS SELECT {columns_str} FROM {table_name}")
    # Drop the old table and rename the new table
    cursor.execute(f"DROP TABLE {table_name}")
    cursor.execute(f"ALTER TABLE {new_table_name} RENAME TO {table_name}")
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Endpoint for adding/removing columns would require more complex handling,
# as SQLite does not support adding or removing columns directly.


@app.route('/table_columns/<table_name>', methods=['GET'])
def get_table_columns(table_name):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = [info[1] for info in cursor.fetchall()]
    conn.close()
    return jsonify(columns)


@app.route('/table/<table_name>/add_column', methods=['POST'])
def add_column(table_name):
    data = request.json
    column_name = data['column_name']
    column_type = data['column_type']  # Example: TEXT, INTEGER, etc.
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/table/<table_name>/add_row', methods=['POST'])
def add_row(table_name):
    data = request.json
    columns = ', '.join(data.keys())
    placeholders = ', '.join(['?'] * len(data))
    values = tuple(data.values())

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(f'INSERT INTO {table_name} ({columns}) VALUES ({placeholders})', values)
    conn.commit()
    conn.close()

    return jsonify({'success': True})

@app.route('/table_info/<table_name>', methods=['GET'])
def table_info(table_name):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    info = cursor.fetchall()
    conn.close()
    # Format and return column names with types
    return jsonify([{ 'name': col[1], 'type': col[2]} for col in info])


@app.route('/table/<table_name>/update_cell', methods=['POST'])
def update_cell(table_name):
    data = request.get_json()
    row_id = data['id']
    column_name = data['column']
    new_value = data['value']

    conn = get_db_connection()
    query = f"UPDATE {table_name} SET {column_name} = ? WHERE id = ?"
    conn.execute(query, (new_value, row_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True})

@app.route('/create_table', methods=['POST'])
def create_table():
    data = request.get_json()
    table_name = data['table_name']
    columns = data['columns']  # This should be a list of dictionaries
    
    # Construct the SQL statement for table creation
    columns_sql = 'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + ', '.join([f"{col['name']} {col['type']}" + (f"({col.get('size', '')})" if col.get('size') else '') for col in columns])
    query = f"CREATE TABLE IF NOT EXISTS {table_name} ({columns_sql})"

    conn = get_db_connection()
    try:
        conn.execute(query)
        conn.commit()
        return jsonify({'success': True, 'message': f"Table '{table_name}' created successfully."})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)


