// "SPDX-License-Identifier: MIT"
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityManager is Ownable {
    
    event CreateIdentity(address indexed addr, string indexed username, string dataUserName, string name, string twitter);
    event UpdateIdentity(address indexed addr, string indexed username, string dataUserName, string name, string twitter);
    event DeleteIdentity(address indexed addr, string indexed username);
    
    struct User {
        string username;
        string name;
        string twitter;
    }
    
    mapping(address => User) private users;
    mapping(string => address) internal usernames;
    
    function createIdentity(address account, string calldata username, string calldata name, string calldata twitter) public onlyOwner {
        User storage user = users[account];
        require(bytes(user.username).length == 0, "Existing identity");
        require(usernames[username] == address(0), "Duplicate username");
        
        user.username = username;
        user.name = name;
        user.twitter = twitter;
        usernames[username] = account;
        
        emit CreateIdentity(account, username, username, name, twitter);
    }
    
    function updateIdentity(address account, string calldata username, string calldata name, string calldata twitter) public onlyOwner {
        User storage user = users[account];

        require(usernames[username] == address(0), "Duplicate username");
        
        usernames[user.username] = address(0);
        usernames[username] = account;
        user.username = username;
        user.name = name;
        user.twitter = twitter;
        
        emit UpdateIdentity(account, username, username, name, twitter);
    }
    
    function deleteIdentity(address account) public onlyOwner {
        User storage user = users[account];
        string memory uname = user.username;
        require(bytes(uname).length != 0, "Identity does not exist");
        
        delete users[account];
        delete usernames[uname];
        
        emit DeleteIdentity(account, uname);
    }
}
