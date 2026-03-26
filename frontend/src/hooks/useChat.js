import { useReducer,useRef,useEffect,useContext} from "react";
import {chatReducer,initialState} from "../reducers/chatReducer";
import {DBContext} from "../context/DBContext";

export default function useChat(){
    const {connection} = useContext(DBContext);
    const [state,dispatch] = useReducer(chatReducer,initialState);
    const chatRef = useRef(null);
    //useEffect that calls bottomRef.current?.scrollIntoView({ behavior: "smooth" }) whenever state.messages changes — dependency array is [state.messages]

    useEffect(() => {
        chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [state.messages]);

    async function sendMessage(question){
        dispatch({type: "ADD_MESSAGE", payload: { id: Date.now(), role: "user", content: question }});
        dispatch({type: "SET_LOADING", payload: true});

        try{
            const res=await fetch("http://localhost:8000/query",{method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({connection_id: connection.id, question})});
            const data = await res.json();
            if(!res.ok){
                throw new Error(data.error || "Something went wrong");
            }
            dispatch({type: "ADD_MESSAGE", payload: {id:Date.now(),role:"assistant", content:"here are the results",sql:data.sql,results:data.results}});
            dispatch({type: "SET_LOADING", payload: false});
        } catch (error) {
            console.error("Error sending message:", error);
            dispatch({type: "SET_ERROR", payload: error.message});
            dispatch({type: "SET_LOADING", payload: false});
        }
    }
    return {state,sendMessage,bottomRef: chatRef};

}