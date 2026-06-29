import sqlite3

def migrate():
    print("Migrating database...")
    conn = sqlite3.connect("zaara_ai.db")
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20);")
        print("Added phone column")
    except Exception as e:
        print(f"Error adding phone: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50);")
        print("Added auth_provider column")
    except Exception as e:
        print(f"Error adding auth_provider: {e}")
        
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN last_login DATETIME;")
        print("Added last_login column")
    except Exception as e:
        print(f"Error adding last_login: {e}")
        
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
