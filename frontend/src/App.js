import { useState, useContext, useEffect } from 'react'
import {
  Button, Heading, Box, FormControl, FormLabel, Input, Flex,
  Center, Text, List, ListItem,
  Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel
} from '@chakra-ui/react'
import { command, withoutKey } from 'tools'
import { useQuery, useLazyQuery, gql } from '@apollo/client'
import { SessionContext } from 'SessionStore'
import { SessionChannelContext } from 'SessionChannelStore'
import { useEventHandler } from '@ericlathrop/phoenix-js-react-hooks'

const GET_ORDER = gql`
  query GetOrder($id: String) {
    order(id: $id)  {
      id name productId createdAt
    }
  }
`

const App = () => {
  const [name, setName] = useState('')
  const [productId, setProductId] = useState('')
  const sessionId = useContext(SessionContext)
  const sessionChannel = useContext(SessionChannelContext)
  const [currentOrderId, setCurrentOrderId] = useState(null)

  const [fetchOrder, { data, refetch }] = useLazyQuery(GET_ORDER, {
    variables: { id: currentOrderId }
  })

  const currentOrder = data?.order

  useEventHandler(sessionChannel, 'OrderInserted', data => { setCurrentOrderId(data.orderId) })
  useEventHandler(sessionChannel, 'OrderReplaced', () => { refetch() })

  useEffect(() => {
    if (currentOrderId) fetchOrder()
  }, [currentOrderId])

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
          Example lifecycle of an "Order" as a Stream of Events and the current state [of that stream] stored in mongo for reading
        </Heading>

        <Flex>
          <Box p={3} border='2px solid gray'>
            <Heading size='md'>
              Available actions:
            </Heading>

            <Box p={3}>
              <Accordion defaultIndex={[0]}>
                <AccordionItem>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left'>
                      <b>Create an Order</b>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>

                  <AccordionPanel pb={4}>
                    <Box backgroundColor='ghostwhite' border='2px solid lightgray' p={2} mb={5} mt={5}>
                      <FormControl>
                        <FormLabel fontWeight='bold'>Customer Name</FormLabel>
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
                  </AccordionPanel>
                </AccordionItem>

                {currentOrder &&
                  <AccordionItem>
                    <AccordionButton>
                      <Box as='span' flex='1' textAlign='left'>
                        <b>Update Order attributes</b>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                      <UpdateOrderAttributes order={currentOrder} />
                    </AccordionPanel>
                  </AccordionItem>}
              </Accordion>

              {!currentOrder &&
                <Text>↑ start with creating a new order ↑</Text>}
            </Box>

          </Box>

          <Center>
            <Box fontSize='90'>
              &#8594;
            </Box>
          </Center>

          <Box p={3} border='2px solid gray'>
            {currentOrder &&
              <OrderStreamEvents orderId={currentOrder.id} />}
          </Box>

          <Center>
            <Box fontSize='90'>
              &#8594;
            </Box>
          </Center>

          <Box p={3} border='2px solid gray'>
            {currentOrder &&
              <OrderCurrentState orderId={currentOrder} />}
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

const GET_STREAM_EVENTS = gql`
  query GetStreamEvents($streamName: String) {
    streamEvents(streamName: $streamName)  {
      eventId, eventType, data, createdAt
    }
  }
`

const OrderStreamEvents = ({ orderId }) => {
  const sessionChannel = useContext(SessionChannelContext)

  const { data, refetch } = useQuery(GET_STREAM_EVENTS, {
    variables: { streamName: `Order:${orderId}` }
  })

  useEventHandler(sessionChannel, 'NewOrderStreamEvent', () => { refetch() })

  return (
    <>
      <Heading size='md'>
        Resulting Stream Events
      </Heading>

      <Text>
        Stream name: "Order:{orderId}"
      </Text>

      <List spacing={2}>
        {data?.streamEvents.map(streamEvent =>
          <ListItem fontSize='10px' key={streamEvent.eventId}>
            <pre>
              {JSON.stringify(withoutKey('__typename', streamEvent), null, 2)}
            </pre>
          </ListItem>
        )}
      </List>
    </>
  )
}

const OrderCurrentState = ({ order }) => {
  return (
    <>
      <Heading size='md' mb='5'>
        Current State
      </Heading>

      <Text>
        Pulled in via graphql from mongo
      </Text>

      <Box>
        <pre style={{ fontSize: '11.5px' }}>
          <b>
            {JSON.stringify(withoutKey('__typename', order), null, 2)}
          </b>
        </pre>
      </Box>
    </>

  )
}

const UpdateOrderAttributes = ({ order }) => {
  const [orderCopy, setOrderCopy] = useState(order)

  console.log('ORDER', order)

  const updatedAttributes =
    Object.entries(orderCopy)
      .reduce((acc, [key, value]) => {
        if (value !== order[key]) {
          return { ...acc, [key]: value }
        } else {
          return acc
        }
      }, {})

  const onClickEditOrder = () =>
    command({
      command: 'UpdateOrderAttributes',
      data: {
        orderId: order.id,
        updatedAttributes,
        csrName: 'csr_123'
      }
    })

  const allowSave =
    Object.entries(updatedAttributes).length > 0 &&
    orderCopy.name.trim().length > 2 &&
    orderCopy.productId.trim().length > 2

  return (
    <>
      <Box backgroundColor='ghostwhite' border='2px solid lightgray' p={2} mb={5} mt={5}>
        <FormControl>
          <FormLabel fontWeight='bold'>Customer Name</FormLabel>
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
        {(allowSave &&
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
      orderId: '${order.id}'
      updatedAttributes: {
        ${Object.entries(updatedAttributes)
          .reduce((acc, [key, value]) =>
            (`${acc}${acc.length > 0 ? '          ' : ''}${key}: '${value.trim()}',\n`),
          '').slice(0, -2)}
      }
    }
  })
})`}
          </Box>) ||
            <Box>
              Make some valid edits
              <br />(at least 3 chars in each field)
            </Box>}
      </pre>
    </>
  )
}

export default App
