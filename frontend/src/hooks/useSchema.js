import { useContext, useMemo,useState } from "react";
import { DBContext } from "../context/DBContext"

export function useSchema() {
    const {schema} = useContext(DBContext)
    const [searchTerm, setSearchTerm] = useState("")
    const filteredTables=useMemo(() => {
        if (!schema) return []
        return schema.filter(table => table.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [schema, searchTerm]);
    
    return {filteredTables, searchTerm, setSearchTerm}
}