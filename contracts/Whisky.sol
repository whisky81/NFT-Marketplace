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
        uint256 tokenId;
        uint256 price;
        AssetStatus status;
        string name;
        string cid;
    }

    mapping(uint256 tokenId => Asset) private _assets;
    uint256 private _availableAssetCount;

    mapping(address account => uint256) private _balances;

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

    error WhiskyTransferFailed(address to, uint256 amount);

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

    /**
     * @dev Users can freely create their own NFTs, and the default value for each NFT is 0.005 ETH.
     *
    */
    function safeMint(string memory name, string memory cid) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _availableAssetCount++;

        Asset memory asset = Asset({ tokenId: tokenId, price: 0.005 ether, status: AssetStatus.Available, name: name, cid: cid });
        _assets[tokenId] = asset;

        _safeMint(_msgSender(), tokenId);

        return tokenId;
    }

    function burn(uint256 tokenId) public override  {
        if (_assets[tokenId].status == AssetStatus.Available) {
            _availableAssetCount--;
        }
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

        _safeTransfer(_ownerOf(tokenId), _msgSender(), tokenId, "");

        if (msg.value > asset.price) {
            _balances[_msgSender()] += (msg.value - asset.price);
        }

        (bool success, ) = payable(owner).call{value: asset.price}("");
        if (!success) {
            revert WhiskyTransferFailed(owner, asset.price);
        }

        return true;     
    }

    function getAvailableTokens() external view returns (Asset[] memory) {
        Asset[] memory availableAssets = new Asset[](_availableAssetCount);

        uint256 idx = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_isAvailableToken(i)) {
                availableAssets[idx] = _assets[i];
                idx++;
            }
        }
        return availableAssets;
    }

    function getTokensOf(address account) external view returns (Asset[] memory) {
        Asset[] memory assets = new Asset[](balanceOf(account));
        uint256 idx = 0;

        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == account) {
                assets[idx] = _assets[i];
                idx++;
            }
        }
        return assets;
    }

    function balance() external view returns (uint256) {
        return _balances[_msgSender()];
    }

    /**
     *  @dev Withdraws the balance of the caller.
     */
    function withdraw() external {
        uint256 amount = _balances[_msgSender()];
        if (amount == 0) {
            return;
        }

        _balances[_msgSender()] = 0;

        (bool success, ) = payable(_msgSender()).call{value: amount}("");
        if (!success) {
            revert WhiskyTransferFailed(_msgSender(), amount);
        }
    }

    function getTokenById(uint256 tokenId) external view returns(Asset memory) {
        _requireOwned(tokenId);
        return _assets[tokenId];
    }

    function _isAvailableToken(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0) && _assets[tokenId].status == AssetStatus.Available; 
    } 
}