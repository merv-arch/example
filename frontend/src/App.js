import {
  Button,
  Heading, HStack, Box, FormControl, FormLabel, Input
} from '@chakra-ui/react'
import { useState } from 'react'
import { command } from 'tools'

const App = () => {
  const [name, setName] = useState('')
  const [product, setProduct] = useState('')

  const onClickPlaceOrder = () =>
    command({
      command: 'PlaceOrder',
      data: {
        name, product
      }
    })
      .then(res => res.ok || window.alert('refused'))

  return (
    <Box p={3}>
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
            <FormLabel fontWeight='bold'>Product</FormLabel>
            <Input value={product} onChange={e => setProduct(e.target.value)} />
          </FormControl>
        </Box>
      </Box>

      <Button onClick={onClickPlaceOrder}>Place Order</Button>
    </Box>
  )
}

export default App
