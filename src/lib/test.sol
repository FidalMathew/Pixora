// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Pixora {
    // Struct to represent a Post by the celebrity
    struct Post {
        uint256 postId;
        address creatorAddress; // Address of the celebrity or creator
        string imageUrl; // URL of the image posted
        string description; // Description of the post
        string canvasSize; // Canvas size (e.g., "1024x768")
        uint256 remixCount; // Counter to track number of remixes
    }

    // Struct to represent a Remix of the Post
    struct Remix {
        uint256 remixId;
        uint256 postId; // Link to the original post
        address artistAddress; // Address of the artist who made the remix
        string remixImageUrl; // URL of the remixed image
        string canvasSize; // Canvas size inherited from the original post
    }

    // Mapping of postId to Post
    mapping(uint256 => Post) public posts;

    // Mapping of remixId to Remix
    mapping(uint256 => Remix) public remixes;

    // Track the number of posts and remixes
    uint256 public postCounter;
    uint256 public remixCounter;

    // Event for when a new post is created
    event PostCreated(
        uint256 postId,
        address creatorAddress,
        string imageUrl,
        string description,
        string canvasSize
    );

    // Event for when a new remix is created
    event RemixCreated(
        uint256 postId,
        uint256 remixId,
        address artistAddress,
        string remixImageUrl,
        string canvasSize
    );

    // Function to create a new post
    function createPost(
        string memory _imageUrl,
        string memory _description,
        string memory _canvasSize
    ) public {
        postCounter++;
        posts[postCounter] = Post(
            postCounter,
            msg.sender,
            _imageUrl,
            _description,
            _canvasSize,
            0
        );

        emit PostCreated(
            postCounter,
            msg.sender,
            _imageUrl,
            _description,
            _canvasSize
        );
    }

    // Function to create a remix for an existing post
    function createRemix(uint256 _postId, string memory _remixImageUrl) public {
        require(_postId > 0 && _postId <= postCounter, "Invalid postId");

        remixCounter++;

        // Fetch the canvas size from the original post
        string memory canvasSize = posts[_postId].canvasSize;

        remixes[remixCounter] = Remix(
            remixCounter,
            _postId,
            msg.sender,
            _remixImageUrl,
            canvasSize
        );

        // Increment the remix count in the original post
        posts[_postId].remixCount++;

        emit RemixCreated(
            _postId,
            remixCounter,
            msg.sender,
            _remixImageUrl,
            canvasSize
        );
    }

    // Get the details of a post
    function getPost(uint256 _postId) public view returns (Post memory) {
        require(_postId > 0 && _postId <= postCounter, "Invalid postId");
        return posts[_postId];
    }

    // Get the details of a remix
    function getRemix(uint256 _remixId) public view returns (Remix memory) {
        require(_remixId > 0 && _remixId <= remixCounter, "Invalid remixId");
        return remixes[_remixId];
    }
}
