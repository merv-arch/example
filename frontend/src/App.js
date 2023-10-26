import { useContext } from 'react'
import {
  Button, Heading, Box, FormControl, FormLabel, Input, Flex,
  Center
} from '@chakra-ui/react'
import { useState } from 'react'
import { command } from 'tools'
import { useQuery, gql } from '@apollo/client'
import { SessionContext } from 'SessionStore'

const App = () => {
  const [name, setName] = useState('')
  const [productId, setProductId] = useState('')
  const [currentOrder, setCurrentOrder] = useState(null)
  const sessionId = useContext(SessionContext)

  const onClickPlaceOrder = () =>
    command({
      command: 'PlaceOrder',
      data: {
        name: name.trim(),
        productId: productId.trim(),
        sessionId
      }
    })
      .then(res => res.ok || res.text())
      .then(text => window.alert(text))

  return (
    <Box p='5'>
      <Heading size='md' mb='5'>
        Merv demo
      </Heading>

      <Heading size='sm' mb='5'>
        Most of the time a web backend is either creating things or updating things.  Merv handles it very differently on the backend, but of course you can end with the same result.
      </Heading>

      <Box>
        <Heading size='md'>
          Example lifecycle of an Order
        </Heading>
        <Flex>
          <Box p={3} border='2px solid gray'>
            <Heading size='md'>
              Create an order
            </Heading>

            <Box maxW='1040px' mt={5}>
              <Box mb={4}>
                <FormControl w='250px'>
                  <FormLabel fontWeight='bold'>Name</FormLabel>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </FormControl>

                <FormControl w='250px'>
                  <FormLabel fontWeight='bold'>Product ID</FormLabel>
                  <Input value={productId} onChange={e => setProductId(e.target.value)} />
                </FormControl>
              </Box>
            </Box>

            <Button
              isDisabled={name.trim().length === 0 || productId.trim().length === 0}
              onClick={onClickPlaceOrder}
            >
              Place Order
            </Button>

            <pre p='0'>
              <Box fontSize='13px'>
                {`
fetch('http://your-server/command', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'PlaceOrder',
    data: {
      name: '${name}',
      product_id: '${productId.trim()}'
    }
  })
})
                `}
              </Box>
            </pre>

            <Box>
              If we're thinking in terms of <a href='https://www.freecodecamp.org/news/crud-operations-crud-definition-in-programming/' target='_blank'>C.R.U.D.</a>, this command is the C.
              <br />
              This command results in a new Stream "Order#{`{new uuid}`}"
            </Box>

            <Box>
              This new stream will have a single Event linked to it:
              <br />
              'OrderPlaced'
              <br />
              with the data:
              <br />
              {`{name: 'eric', product_id: '123'}`}
            </Box>
          </Box>

          <Center>
            <Box fontSize='100px'>
              &#8594;
            </Box>
          </Center>

          <Box p={3} border='2px solid gray'>
            <CurrentOrder id='123' />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

const GET_ORDER = gql`
  query GetOrder($id: String) {
    order(id: $id)  {
      id name productId createdAt
    }
  }
`

const CurrentOrder = ({ id }) => {
  const { data, loading, refetch } = useQuery(GET_ORDER, {
    variables: { id }
  })

  return (
    JSON.stringify(data?.order, 4)
  )

}

export default App
