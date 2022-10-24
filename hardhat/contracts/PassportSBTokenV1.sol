// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "hardhat/console.sol";
import "../constants/stampConstants.sol";

contract PassportSBTokenV1 is 
  Initializable,
  ERC1155Upgradeable,
  OwnableUpgradeable,
  ERC1155BurnableUpgradeable,
  UUPSUpgradeable
{
  string public name;
  string public symbol;
  mapping(string => address) stampHashMapping;

  function initialize(string calldata _name, string calldata _symbol) public initializer {
    name = _name;
    symbol = _symbol;
    __ERC1155_init("https://passport-sbt-minter.vercel.app/json/{tokenId}.json");
    __Ownable_init();
    __ERC1155Burnable_init();
    __UUPSUpgradeable_init();
  }

  // Update the URI
  function setURI(string memory newuri) public onlyOwner {
    _setURI(newuri);
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

  // SINGLE TOKEN MINTING
  function mint(
    uint256 tokenId, 
    string memory stampHash
  ) public virtual {
    require(stampHashMapping[stampHash] == address(0), "Stamp is already minted!");

    stampHashMapping[stampHash] = msg.sender;

    _mint(msg.sender, tokenId, 1, "");
  }

  // BATCH TOKEN MINTING
  function mintBatch(
    uint256[] memory tokenIds,
    string[] memory stampHashes,
    uint256[] memory tokenAmounts
  ) public virtual {
    for (uint256 i = 0; i < tokenIds.length; ++i) {
      require(stampHashMapping[stampHashes[i]] == address(0), "Stamp is already minted!");
      
      stampHashMapping[stampHashes[i]] = msg.sender;
    }
    _mintBatch(msg.sender, tokenIds, tokenAmounts, "");
  }

  // SINGLE TOKEN BURNING
  function burnToken(
    uint256 tokenId, 
    string memory stampHash,
    uint256 amount
  ) public virtual {
    // Delete the element from the mapping
    delete stampHashMapping[stampHash];

    // Burn the SBT
    _burn(msg.sender, tokenId, amount);
  }

  // BATCH TOKEN BURNING
  function burnTokenBatch(
    uint256[] memory tokenIds,
    string[] memory stampHashes,
    uint256[] memory tokenAmounts
  ) public virtual {
    // Needs to remove the items from the mapping
    for (uint256 i = 0; i < tokenIds.length; ++i) {
      delete stampHashMapping[stampHashes[i]];
    }
    _burnBatch(msg.sender, tokenIds, tokenAmounts);
  }

  // @dev Internal hook to disable all transfers
  // Prevents transfers to any accounts other than the zero-address account and 
  // from any accounts other than the zero-address account
  function _beforeTokenTransfer(
      address operator, // address which initiated the transfer == msg.sender
      address from,
      address to,
      uint256[] memory tokenId,
      uint256[] memory amounts,
      bytes memory data
  ) internal override(ERC1155Upgradeable) {
      require(from == address(0) || to == address(0), "Not transferable!");
      super._beforeTokenTransfer(operator, from, to, tokenId, amounts, data);
  }

  function _authorizeUpgrade(address newImplementation)
    internal
    onlyOwner
    override
  {}
}