import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  useAccount, 
  usePrepareContractWrite,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Button, Stack, List, ListItem, useBoolean } from "@chakra-ui/react";

// --- Passport SDK
import { PassportReader } from "@gitcoinco/passport-sdk-reader";

// -- Types
import { TokenTypes, TokenIds, PROVIDER_ID, Stamp, Passport } from "../types/types";

// -- Helpers
import { createHash } from "../utils/helpers";
import { TOKEN_TYPES } from "../constants/tokenTypes";

import contractInterface from "../contract-abi.json";


const reader = new PassportReader("https://ceramic.passport-iam.gitcoin.co", "1");

const contractConfig = {
  addressOrName: "0xe973392bCa55A63a15f9590fbFfd1ADE923d8CB0" || "",
  contractInterface: contractInterface,
}

function App() {
  const { address, isConnected } = useAccount();
  const [isLoading, setLoading] = useState(false);
  const [passport, setPassport] = useState<Passport>();
  const [stamps, setStamps] = useState<Stamp[]>();
  const [providerList, setProviderList] = useState<PROVIDER_ID[]>();
  const [tokenIds, setTokenIds] = useState<TokenIds>();
  const [stampHash, setStampHashes] = useState<String[]>();
  const [tokenAmounts, setTokenAmounts] = useState<Number[]>();
  const [showStamps, setShowStamps] = useBoolean();

  // Load the passport from passport reader and set passport to state  
  useEffect(() => {
    async function getData(): Promise<void> {
      setLoading(true);
      const loadedPassport = await reader.getPassport(address!);
      setPassport(loadedPassport);
    }
    getData();
  }, [address]);
  
  // Set the stamps to state
  useEffect(() => {
    if (passport) {
      setStamps(passport?.stamps?.map(stamp => stamp));
      setLoading(false);
    }
  }, [passport]);
  
  // Set the providerId list to state
  useEffect(() => {
    if (stamps) {
      setProviderList(stamps?.map((stamp) => stamp.provider));
    }
  }, [stamps]);

  // Set the token ids to state
  useEffect(() => {
    if (providerList) {
      setTokenIds(TOKEN_TYPES.filter(tokenType =>
        providerList.includes(tokenType.providerId)).map(tokenType => tokenType.tokenId));
    }
  }, [providerList]);
  
  // Create and set the stamp hashes to state
  useEffect(() => {
    if (providerList) {
      setStampHashes(TOKEN_TYPES.filter(tokenType => providerList.includes(tokenType.providerId)).map(tokenType => createHash(address!, tokenType.providerId)));
    }
  }, [providerList]);
  
  // Create a new array and fill it with the amount of token ids in 
  useEffect(() => {
    if (tokenIds) {
      setTokenAmounts(new Array(tokenIds?.length).fill(1));
    }
  }, [tokenIds]);

  const { config: contractWriteConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: "mintBatch",
    args: [tokenIds, stampHash, tokenAmounts],
  });

  const {
    data: mintData,
    write: mintBatch,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(contractWriteConfig);

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  // const { data: contractData, isFetching, isSuccess: isFetchingSuccess } = useContractRead({
  //     ...contractConfig,
  //     functionName: "mintBatch",
  //     watch: true,
  // })

  const isMinted = txSuccess;

  const mintButton = 
    <Stack align="center">
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
        {!isMintLoading && !isMintStarted || isMinted && "Mint Your Passport SBT"}
      </Button>
    </Stack>

  // const showSbtsButton = 
  //   <Stack align="center">
  //     <Button 
  //       className="flex justify-center m-auto mt-10 p-4 rounded-xl font-bold"
  //       colorScheme="purple"
  //       variant="solid"
  //       size="lg"
  //       disabled={isLoading}
  //       // onClick={() => }
  //     >
  //       {isFetching && "Reading contract..."}
  //       {isFetchingSuccess}
  //     </Button>
  //   </Stack>

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
        <div className="flex justify-center">
          <ConnectButton showBalance={false} />
        </div>
        {isConnected
          ? <div>
              <h2 className="text-center text-2xl font-semibold mt-6 mb-6 break-all">Welcome, {address}!</h2>
              <div>
                {mintButton}
              </div>
        
            </div>
          : <div>
              <p className="text-2xl font-semibold mt-6 mb-6 text-center">Please connect your wallet</p>
            </div>
        }
        {mintError && (
          <p className="text-xl font-semibold text-red-300 text-center m-3">
            Error: {mintError?.message}
          </p>
        )}
        {txError && (
          <p className="text-xl font-semibold text-red-300 text-center m-3">
            Error: {txError?.message}
          </p>
        )}
        <div className="flex justify-center">
          {isConnected && (
              <Button
                  className="flex justify-center mt-9"
                  onClick={setShowStamps.toggle}
                  size="lg"
                  colorScheme="blue"
                  disabled={isLoading}
                >
                  {!showStamps && "Show Your Stamps"}
                  {showStamps && "Hide Your Stamps"}
                </Button>
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
    </main>
  );
}

export default App;
