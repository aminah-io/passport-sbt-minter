// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PassportSBToken is ERC1155, ERC1155Burnable, Ownable {
  // using SafeMath for uint256;

  uint256 public constant TWITTER = 0;
  uint256 public constant ENS = 1;
  uint256 public constant GITHUB = 2;
  uint256 public constant SNAPSHOT_PROPOSALS_PROVIDER = 3;
  uint256 public constant SNAPSHOT_VOTES_PROVIDER = 4;

  constructor() ERC1155("assets_images_url") {
    _mint(msg.sender, TWITTER, 1, "Twitter");
    _mint(msg.sender, ENS, 1, "Ens");
    _mint(msg.sender, GITHUB, 1, "Github");
    _mint(msg.sender, SNAPSHOT_PROPOSALS_PROVIDER, 1, "SnapshotProposalsProvider");
    _mint(msg.sender, SNAPSHOT_VOTES_PROVIDER, 1, "SnapshotVotesProvider");
  }

  mapping(string => address) stampHashes;

  // TOKEN MINTING

  function mint(uint256 tokenType, string memory stampHash) public {
    require(stampHashes[stampHash] == address(0), "Stamp is already minted!");

    stampHashes[stampHash] = msg.sender;

    _mint(msg.sender, tokenType, 1, "");
  }

  // BATCH TOKEN MINTING
  // Loop through the array received from the frontend
  // containing the stamps, and use _mint to mint each one
  // - How much gas will this cost?
  // - Will this actually work?
  // - What does the stampHash consist of (am I creating this?)
  // - How will the batchMint function receive the stamps array 
  // from the frontend, e.g. what do I need to configure in the 
  // wagmi hook to be able to send the array back?

  // function batchMint(
  //   uint256 tokenTypes[],
  //   string memory stampHash
  // ) public {
  // }

  // BURN TOKEN

  function burn(address account, uint256 tokenType, uint256 amount) public override onlyOwner {
    super.burn(account, tokenType, amount);
  }

  // BATCH TOKEN BURNING

  // @dev Internal hook to disable all transfers
  function _beforeTokenTransfer(
      address operator, // address which initiated the transfer == msg.sender
      address from,
      address to,
      uint256[] memory tokenId,
      uint256[] memory amounts,
      bytes memory data
  ) internal override(ERC1155) {
      require(from == address(0), "Not transferable!");
      super._beforeTokenTransfer(operator, from, to, tokenId, amounts, data);
  }
}