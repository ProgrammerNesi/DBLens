from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sql_generator import generate_sql_query
from connector import connect_to_db
from schema_extractor import extract_schema
from schema_extractor import schema_to_text
from validator import validate_sql
from executor import execute_query, execute_with_repair
from embedder import build_index, retrieve_relevant_tables, remove_index

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionRequest(BaseModel):
    host: Optional[str] = None
    port: Optional[int] = None
    user: Optional[str] = None
    password: Optional[str] = None
    database: str  
    db_type: str           


class QueryRequest(BaseModel):
    connection_id: str
    question: str


active_connections = {}

@app.post("/connect")
def connect(req: ConnectionRequest):
    try:
        conn=connect_to_db(req.host, req.port, req.user, req.password, req.database, req.db_type)
        schema = extract_schema(conn, req.db_type)
        connection_id=f"{req.user}@{req.database}"
        active_connections[connection_id] = {"conn": conn,"schema": schema,"db_type": req.db_type,"history": []}
        build_index(schema, connection_id)
        return {"connection_id": connection_id, "database": req.database, "schema": schema}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/query")
def query(req: QueryRequest):
    if req.connection_id not in active_connections:
        print("❌ Connection not found")
        raise HTTPException(status_code=404, detail="Connection not found")

    conn_info = active_connections[req.connection_id]
    conn = conn_info["conn"]
    schema = conn_info["schema"]
    db_type = conn_info["db_type"]
    print(f"Received question: {req.question} for connection: {req.connection_id}")
    try:
        relevant_tables=retrieve_relevant_tables(req.question, req.connection_id)
        schema_text = schema_to_text(relevant_tables if relevant_tables else schema)
        print(f"Relevant tables for '{req.question}':", [t['name'] for t in (relevant_tables or schema)])
        print(schema_text)
        history = conn_info["history"]
        print(history)
        sql_query = generate_sql_query(req.question, schema_text, db_type, history)
        print(f"Generated SQL: {sql_query}")
        execution_result = execute_with_repair(conn, sql_query, schema_text, db_type)
        print(f"Execution result: {execution_result}")
        history.append({"role": "user", "content": req.question})
        history.append({"role": "assistant", "content": sql_query})
        conn_info["history"] = history[-10:]
        return {"sql": sql_query, "results": execution_result}
    except Exception as e:
        print("ACTUAL ERROR:", str(e))  
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}