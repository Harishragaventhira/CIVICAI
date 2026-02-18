import sqlite3
import os
p = r'c:\Users\SEC\Desktop\SmartCityProject\SmartCityProject\smart_city.db'
print('path:', p)
print('exists:', os.path.exists(p))
print('size:', os.path.getsize(p) if os.path.exists(p) else 'N/A')
if os.path.exists(p):
    conn = sqlite3.connect(p)
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = c.fetchall()
    print('tables:', tables)
    for t in tables:
        try:
            c.execute(f"SELECT COUNT(*) FROM {t[0]}")
            print(f"rows in {t[0]}:", c.fetchone()[0])
        except Exception as e:
            print(f"cannot count rows in {t[0]}: {e}")
    conn.close()
