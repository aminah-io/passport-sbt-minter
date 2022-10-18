import { useState } from "react";
import { Box, Image, Button } from "@chakra-ui/react";
import { NftContract } from "alchemy-sdk";
import { TokenId } from "../../types/types";

type StampCardProps = {
  name: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
  tokenType: string | undefined;
  contractAddress?: string | undefined;
  tokenId: string;
  setTokenId: React.Dispatch<React.SetStateAction<TokenId | undefined>>;
  isBurnLoading: boolean;
  isBurnStarted: boolean;
  burnError: Error | null;
  isBurnError: boolean;
  burnTxSuccess: boolean;
  burnTxError: Error | null;
  isBurnTxError: boolean;
  burnToken: Function | undefined;
  isBurned: boolean;
}

export default function StampCard({
  name,
  description,
  imageUrl,
  tokenType,
  contractAddress,
  tokenId,
  setTokenId,
  isBurnLoading,
  isBurnStarted,
  burnError,
  isBurnError,
  burnTxSuccess,
  burnTxError,
  isBurnTxError,
  burnToken,
  isBurned,
}: StampCardProps): JSX.Element {
  const [value, setValue] = useState<string | undefined>();
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
      </Box>
      <Box className="flex justify-center mt-14">
        <Button
          className="m-4 break-words"
          colorScheme="red"
          value={tokenId}
          data-testid="burn-button"
          // disabled={burnToken}
          onClick={(e) => {
            setTokenId(tokenId);
            // setValue((e.target as HTMLInputElement).value);
            burnToken?.();
            console.log(burnTxError)
          }}
        >
          {isBurnLoading && "Waiting for approval"}
          {isBurnStarted && !isBurned && "Burning..."}
          {!burnToken && "Burn Functionality is Preparing..."}
          {!isBurnStarted && !isBurnLoading && burnToken && "Burn SBT"}
        </Button>
      </Box>
    </Box>
  );
}