import pymysql
try:
    conn = pymysql.connect(host='127.0.0.1', user='root', password='', port=3306)
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS kariyerkapisi;")
    print("Database 'kariyerkapisi' created or already exists!")
    conn.close()
except Exception as e:
    print(f"Error connecting to MySQL: {e}")
