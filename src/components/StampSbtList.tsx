// -- Components
import StampCard from "./StampCard";
import { Grid, GridItem } from "@chakra-ui/react";

// -- Types
import { OwnedNftsResponse } from "alchemy-sdk";

type StampSbtListProps = {
  usersTokenList?: OwnedNftsResponse;
  setTokenId: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function StampSbtList({
  usersTokenList,
  setTokenId,
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