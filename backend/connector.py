import mysql.connector
import psycopg2


def connect_to_db(host, port, user, password, database, db_type):
    if db_type=="mysql" :
        con=mysql.connector.connect(
            host=host,   
            port=port,          
            user=user,        
            password=password,
            database=database,
            connection_timeout=10)
    elif db_type=="postgresql":
        con = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=database,
            connect_timeout=10
        )

    else:
        raise ValueError("Unsupported database type. Please choose 'mysql' or 'postgresql'.")
    return con





