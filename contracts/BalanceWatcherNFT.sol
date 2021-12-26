// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./IPriceFetcher.sol";
import "./PortfolioMetadata.sol";

import "hardhat/console.sol";

contract BalanceWatcherNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;

    Counters.Counter private _tokenIds;
    mapping (uint256 => EnumerableSet.AddressSet) tokenAddresses;

    address public baseTokenAddress;   
    address public priceFetcherAddress;
    address public portfolioMetadataAddress;

    IPriceFetcher public priceFetcher;

    constructor(address _baseTokenAddress) ERC721("Balance Watcher", "WATCH") {
        // TODO: Track tokens on L2s
        // TODO: Track multiple addresses
        // TODO: Synthetic version
        // TODO: Choose default wallet
        // TODO: Store wallet list on an L2 if possible - optimistic rollups use async messaging so won't be gasless nor instant
        // TODO: Pinned tokens
        // TODO: Indicate price changes
        
        // TODO: Store baseTokenAddress by tokenId and let owner choose
        setBaseTokenAddress(_baseTokenAddress);

        // TODO: Modifier that checks if priceFetcher is set for functions that require it
    }

    function setBaseTokenAddress(address _baseTokenAddress) public onlyOwner {
        baseTokenAddress = _baseTokenAddress;
    }

    function setPriceFetcherAddress(address _priceFetcherAddress) public onlyOwner {
        priceFetcherAddress = _priceFetcherAddress;
        priceFetcher = IPriceFetcher(_priceFetcherAddress);
    }

    function setPortfolioMetadataAddress(address _portfolioMetadataAddress) public onlyOwner {
        portfolioMetadataAddress = _portfolioMetadataAddress;
    }

    function mint(address _address) public returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_address, newItemId);

        return newItemId;
    }

    function trackToken(uint256 _tokenId, address _tokenAddress) public {
        // Require that user is token owner
        require(ownerOf(_tokenId) == msg.sender, "Not owner of address");
        
        // Require that uni price > 0
        // TODO: Add eth tracking
        uint256 price = priceFetcher.quote(baseTokenAddress, _tokenAddress);
        require(price > 0, string(abi.encodePacked("Price must be non-zero: ", _tokenAddress)));
        tokenAddresses[_tokenId].add(_tokenAddress);
    }

    function trackTokens(uint256 _tokenId, address[] memory _tokenAddresses) public {
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            trackToken(_tokenId, _tokenAddresses[i]);
        }
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        // TODO: New SVG
        return IPortfolioMetadata(portfolioMetadataAddress).tokenURI(tokenId);
    } 

    function getTokenAddresses(uint256 tokenId) public view returns (address[] memory) {
        address[] memory addresses = new address[](tokenAddresses[tokenId].length());
        for (uint256 i = 0; i < tokenAddresses[tokenId].length(); i++) {
            addresses[i] = tokenAddresses[tokenId].at(i);
        }
        return addresses;
    }
}