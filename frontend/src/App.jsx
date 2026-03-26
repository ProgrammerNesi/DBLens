import {useContext} from "react";
import { DBProvider,DBContext } from "./context/DBContext";
import CredentialsForm from "./components/CredentialsForm";
import WorkspacePage from "./components/WorkspacePage";
function AppContent(){
  const { connection} = useContext(DBContext)
  return(<>
    {connection ? (
        <WorkspacePage />
    ) : (
      <CredentialsForm />
    )}
    </>

  )
}

export default function App() {
  return (
    <DBProvider>
      <AppContent />
    </DBProvider>
  )
}