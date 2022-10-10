// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract PassportSBToken is ERC1155, ERC1155Burnable, Ownable {
  address public minter;
  uint256 public constant TWITTER = 0;
  uint256 public constant ENS = 1;
  uint256 public constant GITHUB = 2;
  uint256 public constant SNAPSHOT_PROPOSALS_PROVIDER = 3;
  uint256 public constant SNAPSHOT_VOTES_PROVIDER = 4;

  constructor() ERC1155("https://passport-sbt-minter.vercel.app/{tokenType}.json") {
    minter = msg.sender;
  }

  mapping(string => address) stampHashes;

  // TOKEN MINTING

  function mint(uint256 tokenType, string memory stampHash) public {
    require(stampHashes[stampHash] == address(0), "Stamp is already minted!");

    stampHashes[stampHash] = msg.sender;

    _mint(msg.sender, tokenType, 1, "");
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

  // BURN TOKEN

  // function burn(address account, uint256 tokenType, uint256 amount) public override onlyOwner {
  //   super.burn(account, tokenType, amount);
  // }

  // BATCH TOKEN BURNING
  function burnBatch(
    uint256[] memory tokenIds,
    uint256[] memory tokenAmounts
  ) external {
    _burnBatch(msg.sender, tokenIds, tokenAmounts);
  }

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