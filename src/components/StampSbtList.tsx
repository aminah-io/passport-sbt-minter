// -- Components
import StampCard from "./StampCard";
import { Grid, GridItem } from "@chakra-ui/react";

// -- Types
import { OwnedNftsResponse } from "alchemy-sdk";

type StampSbtListProps = {
  usersTokenList?: OwnedNftsResponse;
  setTokenId: React.Dispatch<React.SetStateAction<number | undefined>>;
  isBurnLoading: boolean;
  isBurnStarted: boolean;
  burnError: Error | null;
  isBurnError: boolean;
  burnTxSuccess: boolean;
  burnTxError: Error | null;
  isBurnTxError: boolean;
  burnToken: Function | undefined;
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
}: StampSbtListProps): JSX.Element {
  const tokenList = usersTokenList?.ownedNfts.map((sbt, i) => {
    if (sbt.contract.address === `${import.meta.env.CONTRACT_ADDRESS}`.toLowerCase()) {
      return (
        <>
          <GridItem key={i} w="100%">
            <StampCard
              key={i}
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
            />
          </GridItem>
        </>
      );
    }
  });
  
  return (
    <Grid templateColumns='repeat(2, 1fr)' gap={4}>
      {tokenList}
    </Grid>
  );
}