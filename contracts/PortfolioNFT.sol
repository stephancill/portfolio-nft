// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IPriceFetcher.sol";
import "./interfaces/IPortfolioNFT.sol";
import "./PortfolioMetadata.sol";

import "hardhat/console.sol";

contract PortfolioNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;

    Counters.Counter private _tokenIds;
    mapping (uint256 => EnumerableSet.AddressSet) tokenAddresses;
    mapping (uint256 => mapping(address => address[])) tokenPricePaths;

    address public baseTokenAddress;   
    address public WETHAddress;
    string public WETHSymbol;
    address[] public WETHPricePath;
    address public priceFetcherAddress;
    address public portfolioMetadataAddress;

    IPriceFetcher public priceFetcher;

    constructor(address _baseTokenAddress, address _WETHAddress, string memory _WETHSymbol, address[] memory _WETHPricePath) ERC721("Lens Portfolio", "LENS") {
        // TODO: Track tokens on L2s
        // TODO: Track multiple addresses
        // TODO: Synthetic version
        // TODO: Choose default wallet
        // TODO: Store wallet list on an L2 if possible - optimistic rollups use async messaging so won't be gasless nor instant
        // TODO: Pinned tokens
        // TODO: Indicate price changes
        
        // TODO: Store baseTokenAddress by tokenId and let owner choose
        setBaseTokenAddress(_baseTokenAddress);
        WETHAddress = _WETHAddress;
        WETHSymbol = _WETHSymbol;

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

        trackToken(newItemId, WETHAddress, WETHPricePath);

        return newItemId;
    }

    function trackToken(uint256 _tokenId, address _tokenAddress, address[] memory _pricePath) public {
        // Require that user is token owner
        require(ownerOf(_tokenId) == msg.sender, "Not owner of address");
        
        // TODO: Use common default token list and register custom tokens
        // TODO: Remove token
        IERC20Metadata(_tokenAddress).symbol();
        IERC20Metadata(_tokenAddress).balanceOf(msg.sender);

        if (_pricePath.length > 0) {
            require(_pricePath.length >= 2, "Path needs to contain at least 2 token addresses");
            require(_pricePath[0] == _tokenAddress, "Path must start with tracked token address");
            require(_pricePath[_pricePath.length-1] == baseTokenAddress, "Path must end with baseTokenAddress");
            priceFetcher.quote(_pricePath);
        }

        tokenAddresses[_tokenId].add(_tokenAddress);
        tokenPricePaths[_tokenId][_tokenAddress] = _pricePath;
    }

    function removeToken(uint256 _tokenId, address _tokenAddress) public {
        // Require that user is token owner
        require(ownerOf(_tokenId) == msg.sender, "Not owner of address");
        tokenAddresses[_tokenId].remove(_tokenAddress);
    }

    function trackTokens(uint256 _tokenId, address[] memory _tokenAddresses, address[][] memory _pricePaths) public {
        require(_tokenAddresses.length == _pricePaths.length);
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            trackToken(_tokenId, _tokenAddresses[i], _pricePaths[i]);
        }
    }

    function removeTokens(uint256 _tokenId, address[] memory _tokenAddresses) public {
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            removeToken(_tokenId, _tokenAddresses[i]);
        }
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        return IPortfolioMetadata(portfolioMetadataAddress).tokenURI(tokenId);
    } 

    function getTokenAddresses(uint256 tokenId) public view returns (address[] memory) {
        address[] memory addresses = new address[](tokenAddresses[tokenId].length());
        for (uint256 i = 0; i < tokenAddresses[tokenId].length(); i++) {
            addresses[i] = tokenAddresses[tokenId].at(i);
        }
        return addresses;
    }

    function getPricePath(uint256 _tokenId, address _tokenAddress) public view returns (address[] memory) {
        return tokenPricePaths[_tokenId][_tokenAddress];
    }
}