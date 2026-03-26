import { createContext, useState } from "react"

// Step 1: create the container, export it so other files can import it
export const DBContext = createContext(null)

// Step 2: create the Provider component
export function DBProvider({ children }) {

  // Step 3: this is where the actual data lives
  const [connection, setConnection] = useState(null)
  const [schema, setSchema] = useState(null)
  // Step 4: wrap children with the Provider
  // put all four things in the value so any component can read OR update them
  return (
    <DBContext.Provider value={{
      connection, setConnection,
      schema, setSchema
    }}>
      {children}
    </DBContext.Provider>
  )
}