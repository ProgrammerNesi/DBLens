import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model=SentenceTransformer('all-MiniLM-L6-v2')

indexes={}

def build_index(schema,connection_id):
    tables=[]
    texts=[]

    for table in schema:
        col_names=", ".join(col["name"] for col in table["columns"])
        text=f"Table: {table['name']} \nColumns: {col_names}"
        tables.append(table)
        texts.append(text)

    embeddings=model.encode(texts,convert_to_numpy=True)
    faiss.normalize_L2(embeddings)

    dimension=embeddings.shape[1]
    index=faiss.IndexFlatIP(dimension)
    index.add(embeddings)


    indexes[connection_id]={
        "index": index,
        "tables": tables
    }

def retrieve_relevant_tables(question,connection_id,top_k=5):
    if connection_id not in indexes:
        return None

    stored=indexes[connection_id]
    index=stored["index"]
    tables=stored["tables"]

    k=min(top_k,len(tables))

    question_embedding=model.encode([question],convert_to_numpy=True)
    faiss.normalize_L2(question_embedding)

    distances, indices=index.search(question_embedding, k)

    relevant_tables=[tables[i] for i in indices[0]]
    return relevant_tables


def remove_index(connection_id):
    if connection_id in indexes:
        del indexes[connection_id]


    
