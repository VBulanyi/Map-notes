import { createContext } from 'react'

const Context = createContext({
    currentUser: null,
    isAuth: false,
    draft: null,
    notes: [],
    currentNote: null
})

export default Context