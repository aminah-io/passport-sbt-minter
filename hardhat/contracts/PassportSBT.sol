// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract PassportSBT is ERC1155 {
  // using SafeMath for uint256;

  uint256 public constant TWITTER = 0;
  uint256 public constant ENS = 1;
  uint256 public constant GITHUB = 2;
  uint256 public constant SNAPSHOT_PROPOSALS_PROVIDER = 3;
  uint256 public constant SNAPSHOT_VOTES_PROVIDER = 4;

  constructor() ERC1155("assets") {
    _mint(msg.sender, TWITTER, 1, "");
    _mint(msg.sender, ENS, 1, "");
    _mint(msg.sender, GITHUB, 1, "");
    _mint(msg.sender, SNAPSHOT_PROPOSALS_PROVIDER, 1, "");
    _mint(msg.sender, SNAPSHOT_VOTES_PROVIDER, 1, "");
  }

  mapping(string => address) stampHashes;

  // @TOKEN MINTING

  function mint(uint256 tokenType, string memory stampHash) public {
    require(stampHashes[stampHash] == address(0), "Stamp is already minted!");

    stampHashes[stampHash] = msg.sender;

    _mint(msg.sender, tokenType, 1, "");
  }

  // BATCH MINTING

  // function batchMint(
  //   uint256 tokenTypes[],
  //   string memory stampHash
  // ) public {
  // }

  // BURN TOKEN

  // function burn(uint tokenType) public {
  //   // Subtract token from mapping
  //   stampHashes[] = 
  // }

  // @dev Internal hook to disable all transfers
  function _beforeTokenTransfer(
      address operator, // address which initiated the transfer == msg.sender
      address from,
      address to,
      uint256[] memory tokenId,
      uint256[] memory amounts,
      // bytes memory data
      // Similar to ERC721EnumerableUpgradeable for 1155
  ) internal override(ERC1155) {
      require(from == address(0), "Not transferable!");
      super._beforeTokenTransfer(operator, from, to, tokenId, amounts, "");
  }
}