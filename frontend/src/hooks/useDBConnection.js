import { useState, useContext } from "react";
import { DBContext } from "../context/DBContext";

export function useDBConnection() {
    const [status, setStatus] = useState("idle")
    const [error, setError] = useState(null)
    const { setConnection, setSchema } = useContext(DBContext)

    async function connectToDB(credentials) {
        setStatus("connecting")
        setError(null)
        try {
            const res = await fetch("http://localhost:8000/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials)
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.detail || "Failed to connect")
            }
            setConnection({ id: data.connection_id, database: credentials.database })
            setSchema(data.schema)
            localStorage.setItem("saved_credentials", JSON.stringify({
                host: credentials.host,
                port: credentials.port,
                user: credentials.user,
                database: credentials.database,
                db_type: credentials.db_type,
            }))
            setStatus("connected")
        }
        catch (err) {
            setError(err.message)
            setStatus("error")
        }
    }
    return { status, error, connectToDB }
}