import { useState, useContext } from 'react'
import {
  Button, Heading, Box, FormControl, FormLabel, Input, Flex,
  Center, Text
} from '@chakra-ui/react'
import { command, withoutKey } from 'tools'
import { useQuery, gql } from '@apollo/client'
import { SessionContext } from 'SessionStore'
import { SessionChannelContext } from 'SessionChannelStore'
import { useEventHandler } from '@ericlathrop/phoenix-js-react-hooks'

const App = () => {
  const [name, setName] = useState('')
  const [productId, setProductId] = useState('')
  const sessionId = useContext(SessionContext)
  const sessionChannel = useContext(SessionChannelContext)
  const [currentOrderId, setCurrentOrderId] = useState(null)

  useEventHandler(sessionChannel, 'OrderInserted', data => { setCurrentOrderId(data.id) })

  const onClickPlaceOrder = () =>
    command({
      command: 'PlaceOrder',
      data: {
        name: name.trim(),
        productId: productId.trim(),
        sessionId
      }
    })
      .then(res => { if (res.ok) { return null } else { throw res } })
      .catch(e => e.text().then(e => window.alert(e)))

  return (
    <Box p='5'>
      <Heading size='md' mb='5'>
        Merv demo
      </Heading>

      <Box>
        <Heading size='md' m='2' pb='4'>
          Example lifecycle of an "Order" as a Stream of Events
        </Heading>

        <Flex maxW='920'>
          <Box p={3} border='2px solid gray'>
            <Heading size='md'>
              Available actions:
            </Heading>

            <Box p={3} border='2px solid gray'>
              <Heading size='md'>
                Create an order
              </Heading>

              <Box backgroundColor='ghostwhite' border='2px solid lightgray' p={2} mb={5} mt={5}>
                <FormControl>
                  <FormLabel fontWeight='bold'>Name</FormLabel>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight='bold'>Product ID</FormLabel>
                  <Input value={productId} onChange={e => setProductId(e.target.value)} />
                </FormControl>

                <Button
                  mt={3}
                  isDisabled={name.trim().length === 0 || productId.trim().length === 0}
                  onClick={onClickPlaceOrder}
                >
                  Place Order
                </Button>
              </Box>

              <pre p='0'>
                <Box fontSize='13px'>
                  {`fetch('https://your-server/command', {
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
  })`}
                </Box>
              </pre>
            </Box>

          </Box>

          <Center>
            <Box fontSize='90'>
              &#8594;
            </Box>
          </Center>

          <Box p={3} border='2px solid gray'>
            {currentOrderId &&
              <CurrentOrder id={currentOrderId} />}

            {!currentOrderId &&
              <>No order yet</>}
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
  const [orderCopy, setOrderCopy] = useState({})
  const sessionChannel = useContext(SessionChannelContext)

  const { data, refetch } = useQuery(GET_ORDER, {
    variables: { id },
    onCompleted: data => setOrderCopy(data.order)
  })

  useEventHandler(sessionChannel, 'OrderUpdated', () => { refetch() })

  const onClickEditOrder = () => {}

  if (!data?.order)
    return null

  const updatedAttributes =
    Object.entries(orderCopy)
      .reduce((acc, [key, value]) => {
        if (value !== data?.order[key]) {
          return { ...acc, [key]: value }
        } else {
          return acc
        }
      }, {})

  const allowSave =
    Object.entries(updatedAttributes).length > 0 &&
    orderCopy.name.trim().length > 2 &&
    orderCopy.productId.trim().length > 2

  return (
    <>
      <Heading size='md' mb='5'>
        "Update" order attributes
      </Heading>

      {(data &&
        <>
          Current Order state
          <pre style={{ fontSize: '11.5px' }}>
            <b>
              {JSON.stringify(withoutKey('__typename', data?.order), null, 2)}
            </b>
          </pre>

          <Box backgroundColor='ghostwhite' border='2px solid lightgray' p={2} mb={5} mt={5}>
            <FormControl>
              <FormLabel fontWeight='bold'>Name</FormLabel>
              <Input
                value={orderCopy.name || ''}
                onChange={e => setOrderCopy({ ...orderCopy, name: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight='bold'>Product ID</FormLabel>
              <Input
                value={orderCopy.productId || ''}
                onChange={e => setOrderCopy({ ...orderCopy, productId: e.target.value })}
              />
            </FormControl>

            <Button
              mt={3}
              isDisabled={!allowSave}
              onClick={onClickEditOrder}
            >
              Save
            </Button>
          </Box>

          <pre p='0'>
            {allowSave &&
              <Box fontSize='13px'>
                {`fetch('https://your-server/command', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'UpdateOrderAttributes',
    data: {
      orderId: '${data?.order.id}'
      updatedAttributes: {
        ${Object.entries(updatedAttributes)
          .reduce((acc, [key, value]) =>
            (`${acc}${acc.length > 0 ? '          ' : ''}${key}: '${value.trim()}',\n`),
          '').slice(0, -2)}
      }
    }
  })
})`}
              </Box> ||
              <Box>
                Make some valid edits
                <br />(at least 3 chars in each field)
              </Box>
            }
          </pre>
        </>
      )}
    </>
  )
}

export default App
