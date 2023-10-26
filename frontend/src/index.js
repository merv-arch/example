import { useContext } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ChakraProvider } from '@chakra-ui/react'
import SessionProvider, { SessionContext } from 'SessionStore'
import { SocketProvider } from '@ericlathrop/phoenix-js-react-hooks'
import {
  ApolloClient, InMemoryCache, ApolloProvider, createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import SessionChannelProvider from 'SessionChannelStore'

const root = ReactDOM.createRoot(document.getElementById('root'))

const SessionSocketProvider = ({ children }) => {
  const sessionId = useContext(SessionContext)

  const socketUrl = 'ws://localhost:4000/socket'
  const socketOptions = { params: { sessionId } }

  return (
    <SocketProvider url={socketUrl} options={socketOptions}>
      {children}
    </SocketProvider>
  )
}

const AppWithApollo = () => {
  const sessionId = useContext(SessionContext)

  const cache = new InMemoryCache()

  const httpLink = createHttpLink({
    uri: 'http://localhost:4000/gql'
  })

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${sessionId}`
      }
    }
  })

  const link = authLink.concat(httpLink)
  const client = new ApolloClient({ link, cache })

  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  )
}

root.render(
  <ChakraProvider>
    <SessionProvider>
      <SessionSocketProvider>
        <SessionChannelProvider>
          <AppWithApollo />
        </SessionChannelProvider>
      </SessionSocketProvider>
    </SessionProvider>
  </ChakraProvider>
)
