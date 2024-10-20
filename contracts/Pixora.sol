// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Pixora is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("PIXORA Tokens", "PIX") {
    }

    function createToken(string memory tokenURI) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    struct Post {
        uint256 postId;
        address owner;
        string imageUrl;
        string description;
        string canvasSize;
        uint256 tokenId;
        uint256 remixCount;
    }

    struct Remix {
        uint256 remixId;
        uint256 postId;
        address owner;
        string imageUrl;
        string description;
        uint256 tokenId;
        string canvasSize;
    }

    mapping(uint256 => Post) public posts;
    mapping(uint256 => Remix) public remixes;
    mapping(address => uint256[]) public userPosts; // Mapping to track user's posts
    mapping(uint256 => uint256[]) public postRemixes; // Mapping to track remixes for each post

    uint256 public postCounter;
    uint256 public remixCounter;

    event PostCreated(uint256 postId, address creatorAddress, string imageUrl, string description, string canvasSize, uint256 tokenId);
    event RemixCreated(uint256 remixId, uint256 postId, address creatorAddress, string imageUrl, string description, string canvasSize, uint256 tokenId);

    function createPost(string memory _imageUrl, string memory _description, string memory _canvasSize, string memory tokenURI) public {
        postCounter++;
        uint256 newTokenId = createToken(tokenURI);
        posts[postCounter] = Post(postCounter, msg.sender, _imageUrl, _description, _canvasSize, newTokenId, 0);
        userPosts[msg.sender].push(postCounter); // Store the post ID under the user's address
        
        emit PostCreated(postCounter, msg.sender, _imageUrl, _description, _canvasSize, newTokenId);
    }

    function createRemix(uint256 _postId, string memory _imageUrl, string memory _description, string memory _canvasSize, string memory tokenURI) public {
        require(_postId > 0 && _postId <= postCounter, "Invalid postId");
        remixCounter++;
        uint256 newTokenId = createToken(tokenURI);
        remixes[remixCounter] = Remix(remixCounter, _postId, msg.sender, _imageUrl, _description, newTokenId, _canvasSize);

        posts[_postId].remixCount++;
        postRemixes[_postId].push(remixCounter); // Store the remix ID under the post ID

        emit RemixCreated(remixCounter, _postId, msg.sender, _imageUrl, _description, _canvasSize, newTokenId);
    }

    function getPost(uint256 _postId) public view returns (Post memory) {
        require(_postId > 0 && _postId <= postCounter, "Invalid postId");
        return posts[_postId];
    }

    function getRemix(uint256 _remixId) public view returns (Remix memory) {
        require(_remixId > 0 && _remixId <= remixCounter, "Invalid remixId");
        return remixes[_remixId];
    }

    // Fetch all posts
    function getAllPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCounter);
        for (uint256 i = 1; i <= postCounter; i++) {
            allPosts[i - 1] = posts[i];
        }
        return allPosts;
    }

    // Fetch all remixes
    function getAllRemixes() public view returns (Remix[] memory) {
        Remix[] memory allRemixes = new Remix[](remixCounter);
        for (uint256 i = 1; i <= remixCounter; i++) {
            allRemixes[i - 1] = remixes[i];
        }
        return allRemixes;
    }

    // Fetch posts created by a specific user
    function getUserPosts(address user) public view returns (Post[] memory) {
        uint256[] memory userPostIds = userPosts[user];
        Post[] memory userPostsArray = new Post[](userPostIds.length);
        for (uint256 i = 0; i < userPostIds.length; i++) {
            userPostsArray[i] = posts[userPostIds[i]];
        }
        return userPostsArray;
    }

    // Fetch remixes based on a specific post ID
    function getRemixesByPostId(uint256 _postId) public view returns (Remix[] memory) {
        require(_postId > 0 && _postId <= postCounter, "Invalid postId");
        uint256[] memory remixIds = postRemixes[_postId];
        Remix[] memory postRemixesArray = new Remix[](remixIds.length);
        for (uint256 i = 0; i < remixIds.length; i++) {
            postRemixesArray[i] = remixes[remixIds[i]];
        }
        return postRemixesArray;
    }
}
