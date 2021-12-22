// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./Base64.sol";
import "./IERC20.sol";

contract BalanceWatcherNFT is ERC721 {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;

    Counters.Counter private _tokenIds;
    mapping (uint256 => address[5]) public tokenAddresses;

    constructor() ERC721("Balance Watcher", "WATCH") { }

    function mint(address _address) public returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_address, newItemId);

        return newItemId;
    }

    function trackToken(uint256 _tokenId, address _tokenAddress, uint8 _index) public {
        // Require that user is token owner
        require(ownerOf(_tokenId) == msg.sender, "Not owner of address");
        // TODO: require that uni price > 0
        // TODO: Add eth tracking

        tokenAddresses[_tokenId][_index] = _tokenAddress;
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        
        // TODO: Track arbitrary tokens, which the user asks it to track
        string memory output = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 300 300"><defs><linearGradient id="bg-gradient" gradientTransform="rotate(45, 0.5, 0.5)"><stop class="stop1" offset="0%"/><stop class="stop2" offset="50%"/><stop class="stop3" offset="100%"/></linearGradient><style>.base { fill: black; font-family: sans-serif; font-size: 24px; vertical-align: text-top;}.item {font-size: 18px;}.sub {font-size: 12px;}.stop1 { stop-color: #EEE9B8; }.stop2 { stop-color: #C0EEB8; }.stop3 { stop-color: #B8E5E3; }</style></defs><rect width="100%" height="100%" fill="url(#bg-gradient)" />';
        output = string(abi.encodePacked(output, '<text x="26" y="44" class="base">Wallet #', Strings.toString(tokenId), '</text>'));
        
        address[5] memory _tokenAddresses = tokenAddresses[tokenId];
        for (uint256 i = 0; i < 5; i++) {
            address _tokenAddress = _tokenAddresses[i];
            bytes[3] memory parts;
            if (_tokenAddress == address(0)) {
                continue;
            } 
            IERC20 tokenContract = IERC20(_tokenAddress);
            /*
            <text x="26" y="80" class="base item">ETH</text>
            <text x="155" y="80" class="base item">$40,000</text>
            <text x="26" y="95" class="base sub">10.0000</text>    
            */
            parts[0] = abi.encodePacked('<text x="26" y="', Strings.toString(80+45*i), '" class="base item">', tokenContract.symbol(), '</text>');
            parts[1] = abi.encodePacked('<text x="145" y="', Strings.toString(80+45*i), '" class="base item">', Strings.toString(tokenContract.balanceOf(ownerOf(tokenId))), '</text>');
            parts[2] = abi.encodePacked('<text x="26" y="', Strings.toString(95+45*i), '" class="base sub">', Strings.toString(tokenContract.balanceOf(ownerOf(tokenId))), '</text>');
            output = string(abi.encodePacked(output, parts[0], parts[1], parts[2]));
        }
        output = string(abi.encodePacked(output, '</text></svg>'));
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Balance Watcher #', Strings.toString(tokenId), '", "description": "This NFT displays the KLIMA balance of the owner address", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    } 
}