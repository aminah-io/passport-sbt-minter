// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract PassportSBToken is ERC1155, ERC1155Burnable, Ownable {
  string public constant IMAGE_URI = "https://passport-sbt-minter.vercel.app/images/";
  string public name = "Passport Soulbound Token";
  string public symbol = "PSBT";

  uint256 public constant TWITTER = 0;
  uint256 public constant ENS = 1;
  uint256 public constant GITHUB = 2;
  uint256 public constant SNAPSHOT_PROPOSALS_PROVIDER = 3;
  uint256 public constant SNAPSHOT_VOTES_PROVIDER = 4;
  uint256 public constant LINKEDIN = 5;
  uint256 public constant DISCORD = 6;

  constructor() ERC1155("https://passport-sbt-minter.vercel.app/json/{tokenId}.json") {}

  mapping(string => address) stampHashes;

  // SINGLE TOKEN MINTING
  function mint(
    uint256 tokenId, 
    string memory stampHash
  ) public {
    require(stampHashes[stampHash] == address(0), "Stamp is already minted!");

    stampHashes[stampHash] = msg.sender;

    console.log("Stamp hash", stampHashes[stampHash]);

    _mint(msg.sender, tokenId, 1, "");
  }

  // BATCH TOKEN MINTING
  function mintBatch(
    uint256[] memory tokenIds,
    string[] memory stampHash,
    uint256[] memory tokenAmounts
  ) public {
    for (uint256 i = 0; i < tokenIds.length; ++i) {
      require(stampHashes[stampHash[i]] == address(0), "Stamp is already minted!");

      stampHashes[stampHash[i]] = msg.sender;
    }
    _mintBatch(msg.sender, tokenIds, tokenAmounts, "");
  }

  // SINGLE TOKEN BURNING
  function burnToken(
    uint256 tokenId, 
    string memory stampHash,
    uint256 amount
  ) public {
    amount = 1;
    delete stampHashes[stampHash];
    _burn(msg.sender, tokenId, amount);
  }

  // BATCH TOKEN BURNING
  function burnTokenBatch(
    uint256[] memory tokenIds,
    string[] memory stampHash,
    uint256[] memory tokenAmounts
  ) public {
    // Needs to remove the items from the mapping
    for (uint256 i = 0; i < tokenIds.length; ++i) {
      delete stampHashes[stampHash[i]];
    }
    _burnBatch(msg.sender, tokenIds, tokenAmounts);
  }

  // METADATA URI
  function uri(uint256 tokenId) override public pure returns (string memory) {
    return string(
      abi.encodePacked(
        "https://passport-sbt-minter.vercel.app/json/",
        Strings.toString(tokenId),
        ".json"
      )
    );
  }

  // @dev Internal hook to disable all transfers
  // Need to figure out how to prevent token transfer to accounts that are not the BURN account...
  function _beforeTokenTransfer(
      address operator, // address which initiated the transfer == msg.sender
      address from,
      address to,
      uint256[] memory tokenId,
      uint256[] memory amounts,
      bytes memory data
  ) internal override(ERC1155) {
      require(from == address(0) || to == address(0), "Not transferable!");
      super._beforeTokenTransfer(operator, from, to, tokenId, amounts, data);
  }
}