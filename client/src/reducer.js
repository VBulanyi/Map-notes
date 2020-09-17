import {
    LOGIN_USER,
    IS_LOGGED_IN,
    SIGNOUT_USER,
    CREATE_DRAFT,
    UPDATE_DRAFT_LOCATTION,
    DELETE_DRATF,
    GET_NOTES,
    CREATE_NOTE,
    SET_NOTE,
    DELETE_NOTE,
    CREATE_COMMENT
} from './actionTypes'

export default function reducer(state, { type, payload }) {
    switch (type) {
        case LOGIN_USER:
            return {
                ...state,
                currentUser: payload
            }
        case IS_LOGGED_IN:
            return {
                ...state,
                isAuth: payload
            }
        case SIGNOUT_USER:
            return {
                ...state,
                isAuth: false,
                currentUser: null
            }
        case CREATE_DRAFT:
            return {
                ...state,
                currentNote: null,
                dtaft: {
                    latitude: 0,
                    longitude: 0
                }
            }
        case UPDATE_DRAFT_LOCATTION:
            return {
                ...state,
                draft: payload
            }
        case DELETE_DRATF:
            return {
                ...state,
                draft: null
            }
        case GET_NOTES:
            return {
                ...state,
                notes: payload
            }
        case CREATE_NOTE:
            const newNote = payload
            const prevNotes = state.notes.filter(note => note._id !== newNote._id)
            return {
                ...state,
                notes: [...prevNotes, newNote]
            }
        case SET_NOTE:
            return {
                ...state,
                currentNote: payload,
                draft: null
            }
        case DELETE_NOTE:
            const deletedNote = payload
            const filtredNotes = state.notes.filter(note => note._id !== deletedNote._id)
            if (state.currentNote) {
                const isCurrentNote = deletedNote._id === state.currentNote._id
                if (isCurrentNote) {
                    return {
                        ...state,
                        notes: filtredNotes,
                        currentNote: null
                    }
                }
            }
            return {
                ...state,
                notes: filtredNotes,
            }
        case CREATE_COMMENT:
            const updatedCurrentNote = payload
            const updatedNotes = state.notes.map(note =>
                note._id === updatedCurrentNote._id ? updatedCurrentNote : note)
            return {
                ...state,
                notes: updatedNotes,
                currentNote: updatedCurrentNote
            }
        default:
            return state
    }
}