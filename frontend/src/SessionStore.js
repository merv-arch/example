import { createContext, useState, useEffect } from 'react'
import * as localForage from 'localforage'
import { v4 as uuid } from 'uuid'

export const SessionContext = createContext(null)

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    sessionId && localForage.setItem('sessionId', sessionId)
  }, [sessionId])

  useEffect(() => {
    sessionId || localForage.getItem('sessionId').then(res => setSessionId(res || uuid()))
  }, [])

  return (
    (
      sessionId &&
        <SessionContext.Provider value={sessionId}>
          {children}
        </SessionContext.Provider>
    ) ||
      <></>
  )
}

export default SessionProvider
