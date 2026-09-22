import { createContext, useContext } from 'react'

export const CoachMenuContext = createContext<() => void>(() => {})
export const useCoachMenu = () => useContext(CoachMenuContext)
