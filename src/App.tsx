import React, { useState, useEffect, useRef, LegacyRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  useAccount, 
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useProvider,
} from "wagmi";
import {getSerializedSignedVC} from "./utils/sign";
import {ethers} from "ethers";

// -- Components
import { 
  Button, 
  Stack, 
  List, 
  ListItem, 
  useBoolean, 
  Drawer, 
  DrawerBody, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerOverlay, 
  DrawerContent, 
  DrawerCloseButton,
  useDisclosure, 
} from "@chakra-ui/react";
import StampSbtList from "./components/StampSbtList";

// --- Passport SDK
import { PassportReader } from "@gitcoinco/passport-sdk-reader";

// -- Types
import { TokenIds, TokenId, PROVIDER_ID, Stamp, Passport, TokenIdHashList } from "../types/types";
import { GetSerializedVCInputs } from "./utils/sign";

// -- Helpers
import { createHash } from "../utils/helpers";
import contractInterface from "../contract-abi.json";
import verifierInterface from "./abi/StampVcVerifier.json";

// -- Constants
import { TOKEN_TYPES } from "../constants/tokenTypes";

import { Network, Alchemy, OwnedNftsResponse } from "alchemy-sdk";

const settings = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_GOERLI,
};


const reader = new PassportReader("https://ceramic.passport-iam.gitcoin.co", "1");

const contractConfig = {
  addressOrName: `${import.meta.env.VITE_PASSPORT_SBT_CONTRACT_ADDRESS}`,
  contractInterface: contractInterface,
}

function App() {
  const { address, isConnected } = useAccount();
  const [isLoading, setLoading] = useState(false);
  const [passport, setPassport] = useState<Passport>();
  const [stamps, setStamps] = useState<Stamp[]>();
  const [providerList, setProviderList] = useState<PROVIDER_ID[]>();
  const [tokenIds, setTokenIds] = useState<TokenIds>();
  const [stampHash, setStampHashes] = useState<string[]>();
  const [burnStampHash, setBurnStampHash] = useState<string>();
  const [tokenAmounts, setTokenAmounts] = useState<Number[]>();
  const [usersTokenList, setUsersTokenList] = useState<OwnedNftsResponse>();
  const [tokenIdHashesList, setTokenIdHashesList] = useState<TokenIdHashList[]>([]);
  const [tokenId, setTokenId] = useState<TokenId>();
  const [showStamps, setShowStamps] = useBoolean();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const btnRef: React.MutableRefObject<undefined> = React.useRef();
  const [proof, setProof] = useState({r:"", s:"", v:0});
  const [vcWithoutProof, setVcWithoutProof] = useState();
  const provider = useProvider();
  const alchemy = new Alchemy(settings);
  
  // Load the passport from passport reader and set passport to state  
  useEffect(() => {
    async function getData(): Promise<void> {
      setLoading(true);
      const loadedPassport = await reader.getPassport(address!);
      setPassport(loadedPassport);
    }
    getData();
  }, [address]);

  // ---- Set the stamps to state
  useEffect(() => {
    if (passport) {
      setStamps(passport?.stamps?.map(stamp => stamp));
      setLoading(false);
    }
  }, [passport]);

  // ---- Set the SBTs the address owns
  useEffect(() => {
    async function getSbtsForAddress(): Promise<void> {
      try {
        if (!isLoading) {
          const owner = await alchemy.nft.getNftsForOwner(address!);
          setUsersTokenList(owner);
        }
      } catch (e: unknown) {
        console.error(e);
      }
    }
    getSbtsForAddress();
  }, [address]);
  

  
  // ---- Set the providerId list to state
  useEffect(() => {
    if (stamps) {
      setProviderList(stamps?.map((stamp) => stamp.provider));
    }
  }, [stamps]);

  // ---- Set the token ids to state
  useEffect(() => {
    if (providerList) {
      setTokenIds(TOKEN_TYPES.filter(tokenType =>
        providerList.includes(tokenType.providerId)).map(tokenType => tokenType.tokenId));
    }
  }, [providerList]);
  
  // ---- Create and set the stamp hashes to state
  useEffect(() => {
    if (providerList) {
      setStampHashes(TOKEN_TYPES.filter(tokenType => providerList.includes(tokenType.providerId)).map(tokenType => createHash(address!, tokenType.providerId)));
    }
  }, [providerList]);
  
  // ---- Create a new array and fill it with the amount of token ids in 
  useEffect(() => {
    if (tokenIds) {
      setTokenAmounts(new Array(tokenIds?.length).fill(1));
    }
  }, [tokenIds]);
  
  useEffect(() => {
    const tokenIdsHashes = [...tokenIdHashesList];
    if (tokenIds && stampHash) {
      for (let i = 0; i < tokenIds?.length; i++) {
        if (tokenIdHashesList[i]?.stampHash !== stampHash[i]) {
          tokenIdsHashes.push({
            tokenId: tokenIds[i],
            stampHash: stampHash[i]
          });
        }
      }
    }
    setTokenIdHashesList(tokenIdsHashes);
  }, [tokenIds, stampHash]);

  const { config: mintContractWriteConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: "mintBatch",
    args: [tokenIds, stampHash, tokenAmounts],
  });

  const { config: burnContractWriteConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: "burnToken",
    args: [tokenId, stampHash],
  });

  const {
    data: mintData,
    write: mintBatch,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
    isError: isMintError
  } = useContractWrite(mintContractWriteConfig);

  const {
    data: burnData,
    write: burnToken,
    isLoading: isBurnLoading,
    isSuccess: isBurnStarted,
    error: burnError,
    isError: isBurnError
  } = useContractWrite(burnContractWriteConfig);

  const {
    data: mintTxData,
    isSuccess: mintTxSuccess,
    error: mintTxError,
    isError: isMintTxError
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const {
    data: burnTxData,
    isSuccess: burnTxSuccess,
    error: burnTxError,
    isError: isBurnTxError
  } = useWaitForTransaction({
    hash: burnData?.hash,
  });

  const isMinted = mintTxSuccess;
  const isBurned = burnTxSuccess;

  const mintButton = 
    <Button 
      className="flex justify-center m-auto mt-10 p-4 rounded-xl font-bold"
      colorScheme="purple"
      variant="solid"
      size="lg"
      disabled={isLoading}
      onClick={() => mintBatch?.()}
    >
      {isMintLoading && "Waiting for approval"}
      {isMintStarted && "Minting..."}
      {!isMintStarted && !isMintLoading && "Mint Your Passport SBTs"}
      {isMintTxError && "ERROR!"}
    </Button>


  const verifyStampVcsButton = 
    <Button
      className="flex justify-center m-auto mt-10 p-4 rounded-xl font-bold"
      colorScheme="orange"
      variant="solid"
      size="lg"
      disabled={isLoading}
      onClick={async () => {
        console.log("generating VC ...");
        const chainId=1;
        const signer = ethers.Wallet.fromMnemonic(import.meta.env.VITE_MNEMONIC);
        const domainName = "stamp-vc-verifier-test";
        const passportDocument = {
          "@context": ["https://www.w3.org/2018/credentials/v1", "https://schema.org", "https://w3id.org/security/v2"],
          "type": ["VerifiableCredential"],
          "credentialSubject": {
            "id": "did:pkh:eip155:1:0x753CFB338925fFEca0ad7f0517362D0CD3085d83",
            "provider": "TenOrMoreGithubFollowers",
            "iamHash": "v0.0.0:YHStCYx6ya3vnyOJSiniYDV8DiMe5Q3mP2U9Cjiuzro="
          },
          "issuer": "did:key:z6MkuTipUJybMY6H7jm4kFic8pnAhKXM5PcaxEMWSB5WmRmG",
          "issuanceDate": "2022-10-05T21:57:39.378Z",
          "expirationDate": "2023-01-03T22:57:39.378Z"
        }
      
        const serializedVC = await getSerializedSignedVC({
          signer,
          chainId,
          domainName,
          // Using the zero address so it's not tied to a single contract and can be verified
          // in multiple ones.
          verifyingContractAddress: ethers.constants.AddressZero,
          document: passportDocument,
        });

        const { v, r, s } = serializedVC.proof.proofValue;
        const { proof, ...vcWithoutProof } = serializedVC;

        const myProvider = new ethers.providers.JsonRpcProvider( "http://localhost:8545" );

        // const verifierContract = new ethers.Contract(import.meta.env.VITE_VERIFIER_CONTRACT_ADDRESS, verifierInterface, provider);
        const verifierContract = new ethers.Contract("0x2fCf4f2950ae63a4F1f7034724CC66Bb0842fe8A", verifierInterface, myProvider);

        // console.log("vcWithoutProof", vcWithoutProof);

        const verificationResult = await verifierContract.verifyStampVc(vcWithoutProof, v, r, s);

        console.log("Verification result: ", verificationResult);

        vcWithoutProof.expirationDate = "Corupted date";
        console.log("vcWithoutProof", vcWithoutProof);
        // const verificationResultBad = await verifierContract.verifyStampVc(vcWithoutProof, v, r, s);
        // console.log("Verification result: ", verificationResultBad);
      }} 
    >Verify Stamp VCs</Button>
    

  const showPassportStamps = () => {
    const stampList = stamps?.map((stamp, i) => {
      return (
          <ListItem key={i}>
            {stamp.provider}
          </ListItem>
      );
    });
    return stampList;
  }

  return (
    <main className="bg-zinc-900 flex justify-center items-center text-white w-full p-10 max-h-full min-h-screen">
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl pb-10 font-bold text-center">
        🛂 Passport SBT Minting
        </h1>
        {isConnected
          ? <div>
              <h2 className="text-center text-2xl font-semibold mt-6 mb-6 break-all">Welcome, <span className="text-teal-200">{address}</span>!</h2>
              <Stack align="center" direction="column">
                {verifyStampVcsButton}
                {mintButton}
              </Stack>
        
            </div>
          : <div>
              <p className="text-2xl font-semibold mt-6 mb-6 text-center">Please connect your wallet</p>
              <div className="flex justify-center">
                <ConnectButton showBalance={false} />
              </div>
            </div>
        }
        {mintError && (
          <p className="text-xl font-semibold text-red-300 text-center m-3">
            Error: {mintError?.message}
          </p>
        )}
        {mintTxError && (
          <p className="text-xl font-semibold text-red-300 text-center m-3">
            Error: {mintTxError?.message}
          </p>
        )}
        <div className="flex flex-row justify-center">
          {isConnected && (
            <>
              <Button
                className="flex justify-center mt-9 mr-1"
                onClick={setShowStamps.toggle}
                size="lg"
                colorScheme="teal"
                disabled={isLoading}
              >
                {!showStamps && "Show Your Stamps"}
                {showStamps && "Hide Your Stamps"}
              </Button>
              <Button
                className="flex justify-center mt-9 ml-1"
                ref={btnRef.current}
                onClick={onDrawerOpen}
                size="lg"
                colorScheme="cyan"
                disabled={isLoading}
              >
                Show SBT Passport
              </Button>
            </>
          )}
        </div>
        <div>
          {
            showStamps
            ? <div className="text-center p-4 bg-white mt-6 text-slate-900 rounded-md">
                <h3 className="text-xl font-semibold mb-3">Your Stamps (including duplicates):</h3>
                <List>
                  {showPassportStamps()}
                </List>
              </div>
            : <div></div>
          }
        </div>
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        placement="right"
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            Passport Soulbound Tokens
          </DrawerHeader>
          <DrawerBody>
            <StampSbtList
              usersTokenList={usersTokenList}
              setTokenId={setTokenId}
              isBurnLoading={isBurnLoading}
              isBurnStarted={isBurnStarted}
              burnError={burnError}
              isBurnError={isBurnError}
              burnTxSuccess={burnTxSuccess}
              burnTxError={burnTxError}
              isBurnTxError={isBurnTxError}
              burnToken={burnToken}
            />
          </DrawerBody>
          <DrawerFooter>
            Passport
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  );
}

export default App;
