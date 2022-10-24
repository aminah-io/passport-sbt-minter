import { useState, useEffect } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Box, Image, Button } from "@chakra-ui/react";
import { NftContract } from "alchemy-sdk";
import { TokenId, TokenIdHashList } from "../../types/types";
import { contractConfig } from "../App";

type StampCardProps = {
  name: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
  tokenType: string | undefined;
  contractAddress?: string | undefined;
  sbtTokenId: string;
  setTokenId: React.Dispatch<React.SetStateAction<TokenId | undefined>>;
  tokenAmount: number;
  tokenIdHashesList: TokenIdHashList[];
  setBurnTxSuccessful: Function;
}

export default function StampCard({
  name,
  description,
  imageUrl,
  tokenType,
  contractAddress,
  sbtTokenId,
  setTokenId,
  tokenAmount,
  tokenIdHashesList,
  setBurnTxSuccessful,
}: StampCardProps): JSX.Element {
  const [tokenIdHash, setTokenIdHash] = useState<TokenIdHashList[]>();

  useEffect(() => {
    const tokenIdHash = tokenIdHashesList.filter(tokenIdHash => {
      return tokenIdHash.tokenId?.toString() == sbtTokenId.toString();
    });
    setTokenIdHash(tokenIdHash);
  }, []);

  useEffect(() => {
    if (isBurned) {
      setBurnTxSuccessful(isBurned);
    }
  });

  const { config: burnContractWriteConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: "burnToken",
    args: [sbtTokenId, tokenIdHash?.[0].stampHash, tokenAmount],
    enabled: Boolean(sbtTokenId),
  });

  const {
    data: burnData,
    write: burnToken,
    isLoading: isBurnLoading,
    isSuccess: isBurnStarted,
    error: burnError,
    isError: isBurnError
  } = useContractWrite(burnContractWriteConfig);

   const {
    data: burnTxData,
    isSuccess: burnTxSuccess,
    error: burnTxError,
    isError: isBurnTxError
  } = useWaitForTransaction({
    hash: burnData?.hash,
  });

  const isBurned = burnTxSuccess;

  return (
    <Box 
      className="border border-solid rounded-lg bg-white mb-4" 
      w="100%" 
      h="124px"
    >
      <img src={imageUrl} className="" alt={description} />
      <Box className="">
        <p className="">{name}</p>
        <p className="">{description}</p>
        <p>{imageUrl}</p>
      </Box>
      <Box className="flex justify-center mt-14">
        <Button
          className="m-4 break-words"
          colorScheme="red"
          value={sbtTokenId}
          data-testid="burn-button"
          onClick={() => {
            burnToken?.();
          }}
        >
          {"Burn SBT"}
        </Button>
      </Box>
    </Box>
  );
}