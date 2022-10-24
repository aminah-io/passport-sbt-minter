import React, { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  useAccount, 
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useSigner,
} from "wagmi";
import { getSerializedSignedVC } from "./utils/sign";
import { GetSerializedVCInputs } from "./utils/sign";
import { ethers } from "ethers";

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
  useToast,
} from "@chakra-ui/react";
import StampSbtList from "./components/StampSbtList";
import { ToastContents } from "./components/ToastContents";

// --- Passport SDK
import { PassportReader } from "@gitcoinco/passport-sdk-reader";

// -- Types
import { TokenIds, TokenId, PROVIDER_ID, Stamp, Passport, TokenIdHashList } from "../types/types";

// -- Helpers
import { createHash } from "../utils/helpers";
import contractInterface from "../contract-abi.json";
import verifierInterface from "./abi/StampVcVerifier.json";

// -- Constants
import { TOKEN_TYPES } from "../constants/tokenTypes";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parse } from "node:path/win32";

const reader = new PassportReader("https://ceramic.passport-iam.gitcoin.co", "1");

export const contractConfig = {
  addressOrName: `${import.meta.env.VITE_PASSPORT_SBT_CONTRACT_ADDRESS}`,
  contractInterface: contractInterface,
}

function App(): JSX.Element {
  const { address, isConnected } = useAccount();
  const [isLoading, setLoading] = useState(false);
  const [passport, setPassport] = useState<Passport>();
  const [stamps, setStamps] = useState<Stamp[]>();
  const [providerList, setProviderList] = useState<PROVIDER_ID[]>();
  const [tokenIds, setTokenIds] = useState<TokenIds>();
  const [stampHash, setStampHashes] = useState<string[]>();
  const [burnTokenIdStampHash, setBurnTokenIdStampHash] = useState<TokenIdHashList>();
  const [tokenAmounts, setTokenAmounts] = useState<number[]>();
  const [tokenIdHashesList, setTokenIdHashesList] = useState<TokenIdHashList[]>([]);
  const [tokenId, setTokenId] = useState<TokenId | string>();
  const [showStamps, setShowStamps] = useBoolean();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const btnRef: React.MutableRefObject<undefined> = React.useRef();
  const toast = useToast();
  const tokenAmount = 1;
  // const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_GOERLI_URL);

  // const signer = provider.getSigner(address);
  // const contract = new ethers.Contract(`${import.meta.env.VITE_PASSPORT_SBT_CONTRACT_ADDRESS}`, contractInterface, signer);

  // const burnToken = (sbtTokenId: TokenId, burnTokenIdStampHash: TokenIdHashList, tokenAmount: number ) => {
  //   return contract.burnToken(sbtTokenId, burnTokenIdStampHash, tokenAmount);
  // }
  
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
    enabled: Boolean(address),
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
    data: mintTxData,
    isSuccess: mintTxSuccess,
    error: mintTxError,
    isError: isMintTxError
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const isMinted = mintTxSuccess;

  const mintButton = 
    <Button 
      className="flex justify-center m-auto mt-10 p-4 rounded-xl font-bold"
      colorScheme="purple"
      variant="solid"
      size="lg"
      disabled={isLoading && !mintBatch}
      onClick={() => {{
        mintBatch?.();
      }}}
    >
      {isMintLoading && "Waiting for approval"}
      {isMintStarted && !isMinted && "Minting..."}
      {!isMintStarted && !isMintLoading && "Mint Your Passport SBTs"}
      {isMinted && "Mint More Passport SBTs"}
    </Button>

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
          <p className="text-xl font-semibold text-red-300 text-center m-3 break-all">
            Error: {mintError?.message}
          </p>
        )}
        {mintTxError && (
          <p className="text-xl font-semibold text-red-300 text-center m-3 break-all">
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
              address={address}
              setTokenId={setTokenId}
              tokenAmount={tokenAmount}
              tokenIdHashesList={tokenIdHashesList}
            />
          </DrawerBody>
          <DrawerFooter >
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  );
}

export default App;
