export const CAP_NHAT_EMAIL = "CAP_NHAT_EMAIL";
export const CAP_NHAT_TOKEN = "CAP_NHAT_TOKEN";
export const CAP_NHAT_USERNAME = "CAP_NHAT_USERNAME";

const initialState = {
    email:"",
    token:"",
    userName:"" 
}

export default function actionForReducer(state = initialState, payload){
    switch(payload.type){
        case CAP_NHAT_EMAIL:
            return{
                ...state,
                token: payload.email
            }
        case CAP_NHAT_TOKEN:
            return {
                ...state,
                token: payload.token
            }
        case CAP_NHAT_USERNAME:
            return {
                ...state,
                token: payload.userName
            } 
        default:
            return state
    }
}