# Buttercup Desktop - Heimdall Implementation Branch

> See main Branch [Buttercup](https://github.com/buttercup/buttercup-desktop/tree/master)

## About
This branch changes implements a new datasource / vault type. A Tide vault, this vault uses heimdall for encryption and authentication. 

The tide vault allows a user to login using a tide account which much like a google account can be used for multiple services, however all information is strictly confidential and zero knowledge, as the encryption / decryption process is performed on the users local machine using heimdall, which uses a decentralized process which has no knowledge of the contents of the decryption / encryption. 

For a more detailed overview of the technology see the [Tide Protocol](https://tide.org/tideprotocol), for information on Heimdall see the [Public Repository](https://github.com/tide-foundation/heimdall)

### Practical Changes for the user
When creating or unlocking a tide vault, you'll be given a login prompt for a Tide Account inplace of a master password, this will then allow you access to load your vault.

A Tide Vault is functionally no different than any other vault that you can create using buttercup, aside from the key difference that the encryption strength is not corralated to the strength of a password.

The login prompt for a Tide Account also has protections against brute force attacks.

<details>
    <summary>Future Features</summary>
    The ability to nominate another Tide Account access to specific group folders in your own tide vault; This is possible due to Tide's technology and is a feature that our team would like to implement. 
</details>

### User Guide
Working releases of this branch of buttercup are available in the **release** section of the repository; A tide account is required for login purposes.
