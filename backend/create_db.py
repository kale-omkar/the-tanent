import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv("DB_HOST", "localhost")
user = os.getenv("DB_USER", "root")
password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "tanent_db")

print(f"Connecting to MySQL at {host} as {user}...")

# Connect to MySQL server (without specifying DB) to create it if it doesn't exist
connection = pymysql.connect(
    host=host,
    user=user,
    password=password
)

try:
    with connection.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database {db_name} created or already exists.")
finally:
    connection.close()
