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
      id name productId createdAt updatedAt lastCsrToTouch
    }
  }
`

const App = () => {
  const [name, setName] = useState('')
  const [productId, setProductId] = useState('')
  const sessionId = useContext(SessionContext)
  const sessionChannel = useContext(SessionChannelContext)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [accordionIndex, setAccordionIndex] = useState(0)

  const [fetchOrder, { data, refetch }] = useLazyQuery(GET_ORDER, {
    variables: { id: currentOrderId }
  })

  useEventHandler(sessionChannel, 'OrderInserted', ({ orderId }) => { setCurrentOrderId(orderId) })
  useEventHandler(sessionChannel, 'OrderReplaced', () => refetch())

  useEffect(() => {
    if (currentOrderId) fetchOrder()
  }, [currentOrderId])

  useEffect(() => {
    if (currentOrderId && data) setAccordionIndex(1)
  }, [data])

  useEffect(() => {
    if (accordionIndex === 0) setCurrentOrderId(null)
  }, [accordionIndex])

  const onClickReset = () => {
    setName('')
    setProductId('')
    setAccordionIndex(0)
  }

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

  const allowPlaceOrder =
    name.trim().length > 0 &&
    productId.trim().length > 0

  return (
    <Box p='5'>
      <Heading size='md' mb='5'>
        Merv demo
      </Heading>

      <Heading color='red' size='md' mb='5'>
        READ EVERYTHING HERE SLOWLY AND CAREFULLY
      </Heading>

      <Box>
        <Heading size='md' m='2' pb='4'>
          Example lifecycle of an "Order" as a Stream of Events and the current state [based on that stream] stored in mongo for reading
        </Heading>

        <Flex>
          <Box p={3} border='2px solid gray'>
            <Heading size='md'>
              Available actions: <Button onClick={onClickReset}>reset</Button>
            </Heading>

            <Box p={3}>
              <Accordion index={accordionIndex}>
                <AccordionItem>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left'>
                      <b>Place an Order</b>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>

                  <AccordionPanel pb={4}>
                    <Text size='md' mb='5'>
                      Placing an order will start a new stream
                    </Text>

                    <Box backgroundColor='ghostwhite' border='2px solid lightgray' p={2} mb={5} mt={5}>
                      {!data?.order &&
                        <Text>↓ start with creating a new order ↓</Text>}
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
                        isDisabled={!allowPlaceOrder}
                        onClick={onClickPlaceOrder}
                        colorScheme='purple'
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

                {data?.order &&
                  <AccordionItem>
                    <AccordionButton>
                      <Box as='span' flex='1' textAlign='left'>
                        <b>Update Order attributes</b>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                      <Text size='md' mb='5'>
                        Now we have a stream, let's send another Command<br />
                        to the server which will create another event and<br />
                        link it to the Order stream, which will cause<br />
                        the current state in mongo to be rebuilt<br />
                        which will broadcast to the frontend (here)<br />
                        which will cause graphql to refetch<br />
                        A lot of cause & effect happening here.
                      </Text>

                      <Text size='md' mb='5'>
                        You'll notice this form takes a<br />
                        customer service rep. name<br />
                        In your production system you'll probably<br />
                        send "userId" in order to track<br />
                        "who made this change"
                      </Text>

                      <UpdateOrderAttributes order={data.order} />
                    </AccordionPanel>
                  </AccordionItem>}
              </Accordion>
            </Box>

          </Box>

          <Center>
            <Box fontSize='90'>
              &#8594;
            </Box>
          </Center>

          <Box p={3} border='2px solid gray'>
            <Heading size='md' mb='5'>
              Stream Events
            </Heading>

            {data?.order &&
              <OrderStreamEvents orderId={data.order.id} />}
          </Box>

          <Center>
            <Box fontSize='90'>
              &#8594;
            </Box>
          </Center>

          <Box p={3} border='2px solid gray'>
            <Heading size='md' mb='5'>
              Current State
            </Heading>

            {data?.order &&
              <>
                <Text>
                  Pulled in via graphql from mongo
                </Text>

                <Box>
                  <pre style={{ fontSize: '11.5px' }}>
                    <b>
                      {JSON.stringify(withoutKey('__typename', data.order), null, 2)}
                    </b>
                  </pre>
                </Box>
              </>}
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
      <Text fontSize='15'>
        Stream name:
        <br />
        "Order:{orderId}"
        <br />
        (newest first)
      </Text>

      [
      <List spacing={2}>
        {data?.streamEvents.map(streamEvent =>
          <ListItem border='1px solid lightgray' as='div' p='1' ml='2' fontSize='10px' key={streamEvent.eventId}>
            <pre>
              {JSON.stringify(withoutKey('__typename', streamEvent), null, 2)}
            </pre>
          </ListItem>
        )}
      </List>
      ]
    </>
  )
}

const UpdateOrderAttributes = ({ order }) => {
  const [orderCopy, setOrderCopy] = useState(order)
  const [csrName, setCsrName] = useState('')

  useEffect(() => {
    setOrderCopy(order)
  }, [order])

  if (!order) return null

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
        csrName: csrName.trim()
      }
    })

  const allowSave =
    Object.entries(updatedAttributes).length > 0 &&
    orderCopy.name.trim().length > 0 &&
    orderCopy.productId.trim().length > 0 &&
    csrName.trim().length > 0

  return (
    <>
      <Box backgroundColor='ghostwhite' border='2px solid lightgray' p={2} mb={5} mt={5}>
        <Box>
          Change the customer name and/or product id,<br />
          and add a CSR name.
        </Box>

        <FormControl mb='2'>
          <FormLabel fontWeight='bold'>Customer Name</FormLabel>
          <Input
            value={orderCopy.name || ''}
            onChange={e => setOrderCopy({ ...orderCopy, name: e.target.value })}
          />
        </FormControl>

        <FormControl mb='2'>
          <FormLabel fontWeight='bold'>Product ID</FormLabel>
          <Input
            value={orderCopy.productId || ''}
            onChange={e => setOrderCopy({ ...orderCopy, productId: e.target.value })}
          />
        </FormControl>

        <FormControl mb='2'>
          <FormLabel fontWeight='bold'>CSR name</FormLabel>
          <Input
            value={csrName}
            onChange={e => setCsrName(e.target.value)}
          />
        </FormControl>

        <Button
          mt={3}
          isDisabled={!allowSave}
          colorScheme='purple'
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
      csrName: '${csrName.trim()}',
      updatedAttributes: {
        ${Object.entries(updatedAttributes)
          .reduce((acc, [key, value]) =>
            (`${acc}${acc.length > 0 ? '        ' : ''}${key}: '${value?.trim()}',\n`),
          '').slice(0, -2)}
      }
    }
  })
})`}
          </Box>
        )}
      </pre>

      <Box>
        Do this step multiple times, then analyze the events and final state ->
      </Box>

      <Box>
        I realize this is a very simple and dumb example and that having an event named as generic as "UpdatedOrderAttributes" goes against the whole point of merv.  In a real merv app I use very specific Events such as "ManagerOverridePrice", "CsrFlagCustomerAsAngry", "AddNoteToOrder".  The more specific the events are the smarter your reactions to them can be.  Consider -> Allowing a manager to override the price of an item in a quote.  You might require that they send a reason along with that command.  One of the reactions to this event can be to send an email to the regional manage that contains the price change and the reason.  We might also LINK that event to a separate stream called "PriceOverridesByManagerX" which is used to generate a count and sum of all price adjustments by that manager.  Just try to shoe-horn such business logic into a CRUD based system...not natural, not fun.
      </Box>
    </>
  )
}

export default App
