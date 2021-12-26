// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import "./Base64.sol";
import "./IPriceFetcher.sol";
import "./OStrings.sol";
import "./CustomSort.sol";
import "./PortfolioData.sol";
import "./IPortfolioNFT.sol";

import "hardhat/console.sol";

interface IPortfolioMetadata {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract PortfolioMetadata is IPortfolioMetadata {
    uint256 constant DECIMALS = 3;

    address portfolioTrackerAddress;
    IPortfolioNFT portfolioTracker;

    constructor(address _portfolioTrackerAddress) {
        portfolioTrackerAddress = _portfolioTrackerAddress;
        portfolioTracker = IPortfolioNFT(portfolioTrackerAddress);
    }

    function getPortfolioData(uint256 tokenId) public view returns (PortfolioData memory) {
        address[] memory tokenAddresses = portfolioTracker.getTokenAddresses(tokenId);
        
        AddressBalanceValue[100] memory valueByAddress;
        PortfolioData memory portfolioData;

        portfolioData.tokenId = tokenId;
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            address _tokenAddress = tokenAddresses[i];
            if (_tokenAddress == address(0)) {
                continue;
            } 
            
            IERC20Metadata tokenContract = IERC20Metadata(_tokenAddress);

            uint256 price = portfolioTracker.priceFetcher().quote(portfolioTracker.baseTokenAddress(), _tokenAddress);
            uint256 balance = tokenContract.balanceOf(portfolioTracker.ownerOf(tokenId)) / (10 ** (tokenContract.decimals()-DECIMALS));
            uint256 value = price * balance / (10 ** DECIMALS);

            valueByAddress[i] = AddressBalanceValue(_tokenAddress, balance, value);

            portfolioData.totalValue += value;
        }

        CustomSort.sortByValue(valueByAddress, 0, int(valueByAddress.length - 1));
        CustomSort.sortByAddress(valueByAddress, 0, int(valueByAddress.length - 1));

        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            uint256 value = valueByAddress[i].value;
            if (i > 3) {
                portfolioData.otherValue += value;
                continue;
            } 

            portfolioData.topTokens[i] = valueByAddress[i];
        }

        return portfolioData;
    }

    function tokenURI(uint256 tokenId) public override view returns (string memory) {
        string memory output = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 300 300"><defs><linearGradient id="bg-gradient" gradientTransform="rotate(45, 0.5, 0.5)"><stop class="stop1" offset="0%"/><stop class="stop2" offset="50%"/><stop class="stop3" offset="100%"/></linearGradient><style>.base { fill: black; font-family: sans-serif; font-size: 24px; vertical-align: text-top;}.item {font-size: 18px;}.sub {font-size: 12px;}.stop1 { stop-color: #EEE9B8; }.stop2 { stop-color: #C0EEB8; }.stop3 { stop-color: #B8E5E3; }</style></defs><rect width="100%" height="100%" fill="url(#bg-gradient)" />';
        output = string(abi.encodePacked(output, '<text x="26" y="44" class="base sub">Wallet #', OStrings.toString(tokenId), '</text>'));
        
        PortfolioData memory portfolioData = getPortfolioData(tokenId);

        for (uint256 i = 0; i < portfolioData.topTokens.length; i++) {
            
            address tokenAddress = portfolioData.topTokens[i].addr;
            uint256 value = portfolioData.topTokens[i].value;
            uint256 balance = portfolioData.topTokens[i].balance;

            IERC20Metadata tokenContract = IERC20Metadata(tokenAddress);

            output = string(abi.encodePacked(output, '<text x="26" y="', OStrings.toString(100+45*i), '" class="base item">', tokenContract.symbol(), '</text>'));
            output = string(abi.encodePacked(output, '<text x="145" y="', OStrings.toString(100+45*i), '" class="base item">$', OStrings.toStringCommaFormatWithDecimals(value, 999), '</text>'));
            output = string(abi.encodePacked(output, '<text x="26" y="', OStrings.toString(100+15+45*i), '" class="base sub">', OStrings.toStringCommaFormatWithDecimals(balance, DECIMALS), '</text>'));
        }

        // Other value
        output = string(abi.encodePacked(output, '<text x="26" y="280" class="base item">Other</text>'));
        output = string(abi.encodePacked(output, '<text x="145" y="280" class="base item">$', OStrings.toStringCommaFormatWithDecimals(portfolioData.otherValue, 999), '</text>'));
        
        // Total value
        output = string(abi.encodePacked(output, '<text x="26" y="65" class="base">$', OStrings.toStringCommaFormatWithDecimals(portfolioData.totalValue, 999), '</text>'));

        output = string(abi.encodePacked(output, '</svg>'));
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Balance Watcher #', OStrings.toString(tokenId), '", "description": "This NFT displays its owners balances of tracked tokens.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }
}