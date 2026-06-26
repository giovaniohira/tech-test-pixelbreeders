import os
import re

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT, quote_ident
from dotenv import load_dotenv

load_dotenv()

DB_NAME_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,62}$")


def validate_db_name(db_name: str) -> str:
    if not DB_NAME_PATTERN.match(db_name):
        raise ValueError(f"Invalid database name: {db_name!r}")
    return db_name


conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST", "localhost"),
    user=os.getenv("POSTGRES_USER", "filevault"),
    password=os.getenv("POSTGRES_PASSWORD", "filevault_secret"),
    dbname="postgres",
    port=os.getenv("POSTGRES_PORT", "5432"),
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

db_name = validate_db_name(os.getenv("POSTGRES_DB", "filevault"))
cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
if not cur.fetchone():
    cur.execute(f"CREATE DATABASE {quote_ident(db_name, conn)}")
    print(f"Database {db_name} created")
else:
    print(f"Database {db_name} already exists")

cur.close()
conn.close()
