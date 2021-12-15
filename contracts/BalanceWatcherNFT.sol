// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Base64.sol";
import "./IERC20.sol";

contract BalanceWatcherNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public klimaAddress;

    constructor(address _klimaAddress) ERC721("Balance Watcher", "WATCH") {
        klimaAddress = _klimaAddress;
    }

    function mint(address _address) public returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_address, newItemId);

        return newItemId;
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        IERC20 tokenContract = IERC20(klimaAddress);
        // TODO: Track arbitrary tokens, which the user asks it to track
        string[4] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: sans-serif; font-size: 24px; }</style><rect width="100%" height="100%" fill="green" /><text x="10" y="180" class="base">';
        parts[1] = tokenContract.symbol();
        parts[2] = Strings.toString(tokenContract.balanceOf(ownerOf(tokenId)));
        parts[3] = '</text></svg>';
        
        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3]));
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Balance Watcher #', Strings.toString(tokenId), '", "description": "This NFT displays the KLIMA balance of the owner address", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    } 
}