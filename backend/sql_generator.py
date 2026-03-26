import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client=genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_sql_query(question,schema_text,db_type,history):
    contents=[]
    if history is None:
        history = []
    print("History in SQL generation:", history)
    for msg in history:
        contents.append(f"{msg['role']}:{msg['content']}")
    print("Contents for SQL generation:", contents)
    prompt = f"""
    You are an expert SQL assistant. Database type: {db_type}
    Schema:
    {schema_text}
    Convert this question to a SQL query: {question}
    Rules:
    - Return ONLY a SELECT query
    - No SHOW, DESCRIBE, or other commands
    - No markdown, no backticks, no explanation
    - Use correct {db_type} syntax
    - If the question cannot be answered with a SELECT query, return: SELECT 'unsupported query' AS message
    """
    contents.append(prompt)
    full_context="\n".join(contents)
    print("Full context for SQL generation:", full_context)
    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=full_context
    )
    print(response)
    print("Raw response from model:", response.text)
    sql_query = response.text.strip()
    print(sql_query)
    return sql_query


def repair_sql(broken_sql,error_message,schema_text,db_type):
    prompt = f"""
    You are an expert SQL assistant. Database type: {db_type}
    Schema:
    {schema_text}
    Here is a SQL query that doesn't work:
    {broken_sql}
    Error message:
    {error_message}
    Please fix the SQL query according to the error message and return a corrected version that follows the rules:
    Rules:
    - Return ONLY a SELECT query
    - No SHOW, DESCRIBE, or other commands
    - No markdown, no backticks, no explanation
    - Use correct {db_type} syntax
    - If the question cannot be answered with a SELECT query, return: SELECT 'unsupported query' AS message
    """

    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
    )

    sql_query = response.text.strip()
    return sql_query