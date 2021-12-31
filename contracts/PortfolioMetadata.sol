// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

import "./libraries/Base64.sol";
import "./libraries/OStrings.sol";
import "./libraries/CustomSort.sol";

import "./interfaces/IPortfolioNFT.sol";
import "./interfaces/IPriceFetcher.sol";

import "./structs/PortfolioData.sol";

import "hardhat/console.sol";

interface IPortfolioMetadata {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract PortfolioMetadata is IPortfolioMetadata {
    uint256 constant DECIMALS = 3;
    uint256 constant WIDTH = 300;

    address portfolioTrackerAddress;
    IPortfolioNFT portfolioTracker;

    constructor(address _portfolioTrackerAddress) {
        portfolioTrackerAddress = _portfolioTrackerAddress;
        portfolioTracker = IPortfolioNFT(portfolioTrackerAddress);
    }

    function getPortfolioData(uint256 tokenId) public view returns (PortfolioData memory) {
        address[] memory tokenAddresses = portfolioTracker.getTokenAddresses(tokenId);
        
        AddressBalanceValue[] memory valueByAddress = new AddressBalanceValue[](tokenAddresses.length);
        PortfolioData memory portfolioData;

        portfolioData.tokenId = tokenId;
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            address _tokenAddress = tokenAddresses[i];
            address[] memory _tokenPricePath = portfolioTracker.getPricePath(tokenId, _tokenAddress);
            if (_tokenAddress == address(0)) {
                continue;
            } 

            IERC20Metadata tokenContract = IERC20Metadata(_tokenAddress);

            (uint256 price, uint256 priceDecimals) = portfolioTracker.priceFetcher().quote(
                _tokenPricePath, _tokenAddress, portfolioTracker.baseTokenAddress()
            );

            uint256 balance = tokenContract.balanceOf(portfolioTracker.ownerOf(tokenId));
            if (_tokenAddress == portfolioTracker.WETHAddress()) { 
                balance += portfolioTracker.ownerOf(tokenId).balance;
            }
            uint256 value = price * balance / (10 ** (DECIMALS+priceDecimals));
            value /= (10 ** (tokenContract.decimals()-DECIMALS));
            balance /= (10 ** (tokenContract.decimals()-DECIMALS));

            valueByAddress[i] = AddressBalanceValue(_tokenAddress, balance, value);

            portfolioData.totalValue += value;
        }
        if (valueByAddress.length > 1) {
            CustomSort.sortByValue(valueByAddress, 0, int(valueByAddress.length - 1));
        }

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
        uint256 entropyOffset = 0;
        
        string memory output = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" width="300" height="300" viewBox="0 0 300 300">';
        
        string[4] memory colors;

        for (uint256 i = 0; i < 4; i++) {
            colors[i] = rgbaColorString(
                randomUint(tokenId, entropyOffset++), 
                randomUint(tokenId, entropyOffset++), 
                randomUint(tokenId, entropyOffset++),
                i%2 == 0 ? "0.4" : "0.1"
            );
        }

        output = string(abi.encodePacked(
            output, '<defs>', 
            generateGradient(colors[0], colors[1], 0), 
            generateGradient(colors[2], colors[3], 1),
            '<style>.base { font: bold 30px sans-serif; fill: white}.item { font: normal 24px sans-serif; fill: white}.sub { font: normal 14px sans-serif; fill: white}</style></defs>',
            '<rect width="100%" height="100%" fill="#272727"/>'
        ));
        
        PortfolioData memory portfolioData = getPortfolioData(tokenId);

        uint256 width1 = 80 + ((WIDTH - 80) * ((randomUint(tokenId, entropyOffset++) * 1000 / uint256(255) / 100))) / 10; // Range 80-300
        uint256 width2 = 80 + ((WIDTH - 80) * ((randomUint(tokenId, entropyOffset++) * 1000 / uint256(255) / 100))) / 10; // Range 80-300

        if (width2 > width1) {
            uint256 tmp = width1;
            width1 = width2;
            width2 = tmp;
        }

        uint256 rotation1 = (45 * (randomUint(tokenId, entropyOffset++) % 8));
        uint256 rotation2 = (45 * (randomUint(tokenId, entropyOffset++) % 8));

        string memory shapeBack = randomUint(tokenId, entropyOffset++) % 2 == 0 ? generateCircle(width1, rotation1, 0) : generateSquare(width1, rotation1, 0);
        string memory shapeFront = randomUint(tokenId, entropyOffset++) % 2 == 0 ? generateCircle(width2, rotation2, 1) : generateSquare(width2, rotation2, 1);

        output = string(abi.encodePacked(output, shapeBack, shapeFront));

        output = string(abi.encodePacked(output, '<text x="20" y="30" class="sub">Wallet #', OStrings.toString(tokenId), '</text>'));

        for (uint256 i = 0; i < portfolioData.topTokens.length; i++) {
            
            address tokenAddress = portfolioData.topTokens[i].addr;
            uint256 value = portfolioData.topTokens[i].value;
            uint256 balance = portfolioData.topTokens[i].balance;

            if (tokenAddress == address(0)) {
                continue;
            }

            IERC20Metadata tokenContract = IERC20Metadata(tokenAddress);

            string memory symbol = tokenAddress != portfolioTracker.WETHAddress() ? tokenContract.symbol() : portfolioTracker.WETHSymbol();

            output = string(abi.encodePacked(output, '<text x="20" y="', OStrings.toString(100+45*i), '" class="item">', symbol, '</text>'));
            output = string(abi.encodePacked(output, '<text x="150" y="', OStrings.toString(100+45*i), '" class="item">$', OStrings.toStringCommaFormatWithDecimals(value, 999), '</text>'));
            output = string(abi.encodePacked(output, '<text x="20" y="', OStrings.toString(100+14+45*i), '" class="base sub">', OStrings.toStringCommaFormatWithDecimals(balance, DECIMALS), '</text>'));
        }

        // Other value
        output = string(abi.encodePacked(output, '<text x="20" y="280" class="item">Other</text>'));
        output = string(abi.encodePacked(output, '<text x="150" y="280" class="item">$', OStrings.toStringCommaFormatWithDecimals(portfolioData.otherValue, 999), '</text>'));
        
        // Total value
        output = string(abi.encodePacked(output, '<text x="20" y="58" class="base">$', OStrings.toStringCommaFormatWithDecimals(portfolioData.totalValue, 999), '</text>'));

        output = string(abi.encodePacked(output, '</svg>'));
        
        // JSON
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Balance Watcher #', OStrings.toString(tokenId), '", "description": "This NFT displays its owners balances of tracked tokens.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }

    function randomUint(uint256 seed, uint256 offset) public view returns (uint256) {
        require(offset < 32, "Offset out of bounds");
        bytes32 entropy = keccak256(abi.encodePacked(portfolioTrackerAddress, seed));
        bytes32 mask = bytes32(0xff << (offset * 8));
        return uint256((entropy & mask) >> (offset * 8));
    }

    function generateCircle(uint256 diameter, uint256 rotate, uint256 index) public pure returns (string memory) {
        string memory center = OStrings.toString(WIDTH/2);
        return string(abi.encodePacked(
            '<circle fill="url(#paint', OStrings.toString(index), ')" transform="rotate(', 
            OStrings.toString(rotate), '', center, ' ', center, ')" cx="', center, '" cy="', center, '" r="', 
            OStrings.toString(diameter/2), '" />'));
    }

    function generateSquare(uint256 width, uint256 rotate, uint256 index) public pure returns (string memory) {
        string memory origin = OStrings.toString((WIDTH-width)/2);
        string memory center = OStrings.toString(WIDTH/2);
        return string(abi.encodePacked(
            '<rect fill="url(#paint', OStrings.toString(index), ')" x="', origin, '" y="', origin, '"', 
            ' width="', OStrings.toString(width), '" height="', OStrings.toString(width), '" transform="rotate(', 
            OStrings.toString(rotate), ' ', center, ' ', center, ')" />'));
    }

    function hexColorString(uint256 r, uint256 g, uint256 b, uint256 a) public pure returns (string memory) {
        return OStrings.toHexColorString((r << 16) | (g << 8) | b, a);
    }

    function rgbaColorString(uint256 r, uint256 g, uint256 b, string memory a) public pure returns (string memory) {
        return string(abi.encodePacked(
            'rgba(', 
            OStrings.toString(r), ', ', 
            OStrings.toString(g), ', ', 
            OStrings.toString(b), ', ', 
            a,
            ')'
        ));
    }

    function generateGradient(string memory startColor, string memory endColor, uint256 index) public pure returns (string memory) {
        return string(abi.encodePacked(
            '<linearGradient id="paint', OStrings.toString(index), '"> <stop stop-color="', startColor, '"/> <stop offset="0.5" stop-color="',
            endColor, '"/></linearGradient>'));

    }
}