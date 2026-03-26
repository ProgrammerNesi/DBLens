export const initialState = {
  messages: [],
  isLoading: false,
  error: null
}

export function chatReducer(state, action) {
  switch (action.type) {
    case "ADD_MESSAGE":
        return {
            ...state,
            messages: [...state.messages, action.payload]
        }
    
    case "SET_LOADING":
        return{
            ...state,
            isLoading: action.payload
        }
    
    case "SET_ERROR":
        return{
            ...state,
            error: action.payload
        }

    case "CLEAR_ERROR":
        return{
            ...state,
            error: null
        }

    default:
      return state
  }
}