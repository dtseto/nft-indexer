import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
// need import ethers for wallet
import { ethers } from "ethers";
import { Alchemy, Network } from 'alchemy-sdk';
import { useState } from 'react';

//ethers for wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);

function App() {

  //connect wallet
  async function connectWallet() {
    if(!window.ethereum){
      alert("MetaMask is not installed!")
    } 
    const accounts = await provider.send('eth_requestAccounts', []);
    setAccount(accounts[0]);
  }


  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  //get nfts 
  async function getNFTsForOwner() {
    const config = {
      apiKey: '4OwtEJoKoCLjm0T5myGkeMtrgd6-DJcL' ,
      network: Network.ETH_MAINNET,
    };
    const alchemy = new Alchemy(config);

        // error checking and ens checking
        //const addr = document.getElementById('inputAddress').value;
        const isAddress = ethers.utils.isAddress(userAddress);
        const isENS = await alchemy.core.resolveName(userAddress);
    
        if (!isAddress && isENS == null){
          alert("Please type a valid address!");
        } else {
          const data = await alchemy.nft.getNftsForOwner(userAddress);
          setResults(data);
        }
  
        

    const data = await alchemy.nft.getNftsForOwner(userAddress);
    setResults(data);

    const tokenDataPromises = [];


    // array for nfts and promises for mapping later
    for (let i = 0; i < data.ownedNfts.length; i++) {
      const tokenData = alchemy.nft.getNftMetadata(
        data.ownedNfts[i].contract.address,
        data.ownedNfts[i].tokenId
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>

          <Button variant="outline" onClick={connectWallet} size="sm" bgColor="silver">
        Connect Wallet
        </Button>


          <Text>
            Plug in an address and this website will return all of its NFTs!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>Get all the ERC-721 tokens of this address:</Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getNFTsForOwner} mt={36} bgColor="silver">
          Fetch NFTs
        </Button>

        <Heading my={36}>Here are your NFTs:</Heading>

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.ownedNfts.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="black"
                  bg="none"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Name:</b> {tokenDataObjects[i].title}&nbsp;
                  </Box>
                  <Image src={tokenDataObjects[i].rawMetadata.image} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! The query may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;
