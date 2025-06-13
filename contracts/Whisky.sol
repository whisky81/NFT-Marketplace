// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract Whisky is ERC721, ERC721Burnable {
    using Strings for uint256;

    uint256 private _nextTokenId;

    enum AssetStatus {
        Available,
        Archived
    }
    struct Asset {
        uint256 price;
        AssetStatus status;
        string name;
        string cid;
    }

    mapping(uint256 tokenId => Asset) private _assets;
    uint256 private _availableAssetCount;

    event AssetTraded(uint256 tokenId, address owner, address buyer, uint256 price, uint256 timestamp);

    /**
     * @dev Minting: The price provided for the minting operation is less than the minimum required (e.g., 0.005 ETH).
     * This error indicates that the input `price` does not meet the contract's minimum pricing criteria for a token.
     * @param price The invalid price value provided by the account, in wei.
     */
    error WhiskyInvalidPrice(uint256 price);

    /**
     * @dev Buying: The amount of Ether sent with the transaction is less than the required token price.
     * This error signifies that the payment (`amount`) is not sufficient to cover the cost (`price`) of the token being purchased.
     * @param price The required token price, in wei.
     * @param amount The insufficient amount of Ether sent by the account, in wei.
     */
    error WhiskyInsufficientPayment(uint256 price, uint256 amount);

    constructor()
        ERC721("Whisky", "W")
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        if (bytes(baseURI).length > 0) {
            Asset memory asset = _assets[tokenId];
            return string.concat(baseURI, asset.cid);
        }

        return "";
    }

    function safeMint(string memory name, string memory cid) public payable returns (uint256) {
        if (msg.value < 0.005 ether) {
            revert WhiskyInvalidPrice(msg.value);
        }

        uint256 tokenId = _nextTokenId++;
        _availableAssetCount++;

        uint256 price = (msg.value * 110) / 100;
        Asset memory asset = Asset({ price: price, status: AssetStatus.Available, name: name, cid: cid });
        _assets[tokenId] = asset;

        _safeMint(_msgSender(), tokenId);

        return tokenId;
    }

    function burn(uint256 tokenId) public override  {
        _availableAssetCount--;
        super.burn(tokenId);
    }

    function resell(uint256 tokenId) public {
        address owner = _ownerOf(tokenId);
        _checkAuthorized(owner, _msgSender(), tokenId);

        _availableAssetCount++;
        _assets[tokenId].status = AssetStatus.Available;

        uint256 oldPrice = _assets[tokenId].price;
        _assets[tokenId].price = (oldPrice * 110) / 100; 
    }

    function buy(uint256 tokenId) public payable returns(bool){
        address owner = _requireOwned(tokenId);

        Asset memory asset = _assets[tokenId];
        if (asset.price > msg.value) {
            revert WhiskyInsufficientPayment(asset.price, msg.value); 
        }

        _availableAssetCount--;
        _assets[tokenId].status = AssetStatus.Archived;

        _safeTransfer(_ownerOf(tokenId), _msgSender(), tokenId);   

        if (asset.price < msg.value) {
            payable(_msgSender()).transfer(msg.value - asset.price);
        }
        payable(owner).transfer(asset.price);

        emit AssetTraded(tokenId, owner, _msgSender(), asset.price, block.timestamp);
        return true;     
    }

    function getAvailableTokens() external view returns (Asset[] memory) {
        Asset[] memory availableAssets = new Asset[](_availableAssetCount);

        uint256 idx = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_isAvailableToken(i)) {
                availableAssets[idx++] = _assets[i];
            }
        }
        return availableAssets;
    }

    function getTokensOf(address account) external view returns (Asset[] memory) {
        Asset[] memory assets = new Asset[](balanceOf(account));
        uint256 idx = 0;

        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == account) {
                assets[idx++] = _assets[i];
            }
        }
        return assets;
    }
    function _isAvailableToken(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0) && _assets[tokenId].status == AssetStatus.Available; 
    } 
}
