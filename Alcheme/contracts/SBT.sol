// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// Remix 编译请使用以下导入方式（指向 v4.9.6）
import "@openzeppelin/contracts@4.9.6/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.9.6/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
contract AlchemeSBT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => address) public tokenCreators;
    mapping(uint256 => uint256) public tokenEvolution;
    event SoulMinted(address indexed creator, uint256 indexed tokenId, string tokenURI);
    event SoulEvolved(address indexed creator, uint256 indexed tokenId, string newTokenURI);
    constructor() ERC721("Alcheme", "ALCH") {}
    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenCreators[tokenId] = to;
        emit SoulMinted(to, tokenId, uri);
        return tokenId;
    }
    function evolve(uint256 tokenId, string memory newUri) external {
        require(_exists(tokenId), "SBT: token not exist");
        require(tokenCreators[tokenId] == msg.sender, "SBT: only creator");
        _setTokenURI(tokenId, newUri);
        tokenEvolution[tokenId]++;
        emit SoulEvolved(msg.sender, tokenId, newUri);
    }
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721) {
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    function canEvolve(uint256 tokenId, address account) external view returns (bool) {
        return _exists(tokenId) && tokenCreators[tokenId] == account;
    }
    function getEvolutionCount(uint256 tokenId) external view returns (uint256) {
        return tokenEvolution[tokenId];
    }
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
