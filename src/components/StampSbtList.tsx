// -- Components
import StampCard from "./StampCard";
import { Grid, GridItem } from "@chakra-ui/react";

// -- Types
import { OwnedNftsResponse } from "alchemy-sdk";
import { TokenId } from "../../types/types";

type StampSbtListProps = {
  usersTokenList?: OwnedNftsResponse;
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

export default function StampSbtList({
  usersTokenList,
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
}: StampSbtListProps): JSX.Element {
  const tokenList = usersTokenList?.ownedNfts.map((sbt, i) => {
    if (sbt.contract.address === `${import.meta.env.VITE_PASSPORT_SBT_CONTRACT_ADDRESS}`.toLowerCase()) {
      return (
        <StampCard
          key={sbt.tokenId}
          name={sbt.rawMetadata?.name}
          description={sbt.rawMetadata?.description}
          imageUrl={sbt.rawMetadata?.image}
          tokenType={sbt.contract?.tokenType}
          contractAddress={sbt.contract?.address}
          tokenId={sbt.tokenId}
          setTokenId={setTokenId}
          isBurnLoading={isBurnLoading}
          isBurnStarted={isBurnStarted}
          burnError={burnError}
          isBurnError={isBurnError}
          burnTxSuccess={burnTxSuccess}
          burnTxError={burnTxError}
          isBurnTxError={isBurnTxError}
          burnToken={burnToken}
          isBurned={isBurned}
        />
      );
    }
  });
  
  return (
    <Grid templateColumns='repeat(2, 1fr)' gap={4}>
      <GridItem w="100%">
        {tokenList}
      </GridItem>
    </Grid>
  );
}