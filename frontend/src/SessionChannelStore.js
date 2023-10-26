import { createContext, useContext } from 'react'
import { useChannel } from '@ericlathrop/phoenix-js-react-hooks'
import { SessionContext } from 'SessionStore'

export const SessionChannelContext = createContext(null)

export const SessionChannelProvider = ({ children }) => {
  const sessionId = useContext(SessionContext)

  const sessionChannel = useChannel(`Session:${sessionId}`, null, () => {})

  return (
    (
      sessionChannel &&
        <SessionChannelContext.Provider value={sessionChannel}>
          {children}
        </SessionChannelContext.Provider>
    ) || null
  )
}

export default SessionChannelProvider
