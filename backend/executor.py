
from sql_generator import repair_sql
from validator import validate_sql
import time

def execute_query(conn,query:str)->dict:
    cur=conn.cursor()
    columns = []
    result = []
    try:
        cur.execute(query)
        columns = [desc[0] for desc in cur.description]
        rows = cur.fetchall()
        result = [dict(zip(columns, row)) for row in rows]
    finally:
        cur.close()
    return {"columns": columns, "rows": result}


def execute_with_repair(conn,sql,schema_text,db_type):
    error_message = ""
    for _ in range(3):
        try:
            if(not validate_sql(sql)):
                sql = repair_sql(sql, "Query is not a valid SELECT statement", schema_text, db_type)
                continue
            return execute_query(conn, sql)
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                time.sleep(60)  # wait 1 minute then retry
            else:
                raise
    raise Exception(f"Failed to execute query after 3 attempts. Last error: {error_message}")