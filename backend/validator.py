import sqlglot

def validate_sql(query:str) -> bool:
    try:
        qlist = sqlglot.parse(query)
        if not qlist:
            return False
        for q in qlist:
            if not isinstance(q, (sqlglot.expressions.Select,sqlglot.expressions.Union)):
                return False
        return True
    except sqlglot.errors.ParseError:
        return False