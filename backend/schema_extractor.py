import mysql.connector
import psycopg2

def extract_schema(conn,db_type):
    cur=conn.cursor()
    schema = []
    try:
        if(db_type=="mysql"):
            cur.execute("SHOW TABLES")
            tables = [row[0] for row in cur.fetchall()]
            schema = []
            for table in tables:
                cur.execute(f"DESCRIBE {table}")
                columns = []
                for row in cur.fetchall():
                    columns.append({
                        "name": row[0],
                        "type": row[1],
                        "nullable": row[2] == "YES",
                        "key": row[3]
                    })
                schema.append({
                    "name": table,
                    "columns": columns
                })
        elif(db_type=="postgresql"):
            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = [row[0] for row in cur.fetchall()]
            schema = []
            for table in tables:
                cur.execute("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = %s", (table,))
                columns = []
                for row in cur.fetchall():
                    columns.append({
                        "name": row[0],
                        "type": row[1],
                        "nullable": row[2] == "YES",
                        "key": ""
                    })
                schema.append({
                    "name": table,
                    "columns": columns
                })

        else:
            raise ValueError("Unsupported database type. Please choose 'mysql' or 'postgresql'.")
        
    finally:   
            cur.close()

    return schema





def schema_to_text(schema):
    text = ""
    for table in schema:
        text += f"Table: {table['name']}\n"
        col_parts = []
        for column in table['columns']:
            if column["key"]=="PRI":
                col_str = f"{column['name']} ({column['type']}, PRIMARY KEY)"
            else:
                col_str = f"{column['name']} ({column['type']})"
            col_parts.append(col_str)

        text += "Columns: " + ", ".join(col_parts) + "\n\n"
    return text

