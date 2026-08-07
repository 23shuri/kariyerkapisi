import sqlite3
import os

db_path = 'instance/kariyerkapisi.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

columns = [
    ("education_json", "TEXT", "'[]'"),
    ("experience_json", "TEXT", "'[]'"),
    ("languages_json", "TEXT", "'[]'"),
    ("certificates_json", "TEXT", "'[]'"),
    ("projects_json", "TEXT", "'[]'"),
    ("bio", "TEXT", "NULL"),
    ("phone", "TEXT", "NULL"),
    ("birth_date", "TEXT", "NULL"),
    ("work_status", "TEXT", "NULL"),
    ("salary_expectation", "TEXT", "NULL"),
    ("work_preference", "TEXT", "NULL"),
    ("github_url", "TEXT", "NULL"),
    ("linkedin_url", "TEXT", "NULL"),
    ("portfolio_url", "TEXT", "NULL"),
    ("cover_photo_url", "TEXT", "NULL")
]

for col_name, col_type, default_val in columns:
    try:
        cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type} DEFAULT {default_val}")
        print(f"Added column {col_name}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"Column {col_name} already exists")
        else:
            print(f"Error adding {col_name}: {e}")

conn.commit()
conn.close()
print("Done!")
