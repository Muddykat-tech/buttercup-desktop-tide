# Buttercup Desktop - Heimdall Implementation Branch

> See main branch of [Buttercup](https://github.com/buttercup/buttercup-desktop/tree/master)<br>
> Warning Tide Network is currently under development and has periodic resets, which may result in tide **account deletion**.<br>
> Treat this repository more of a proof of concept until futher notice.<br>

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

<details>
    <summary>Reporting Issues</summary>
    Check the <a href="https://github.com/Muddykat-tech/buttercup-desktop-tide/issues">Issues</a> Section in the github 
</details>

<details>
    <summary>FAQ</summary>
    Q: Why am I getting a warning that the enclave could not be verified at the tide login screen? <br>
    A: This warning is in place because we don't have a true Vendor Key, this system is used to authenticate if the application is a geniune instance, as we don't have it the warning is in place to warn users to only install the app from known good sources.
</details>

### User Guide
Working releases of this branch of buttercup are available in the **release** section of the repository; A tide account is required for login purposes.

#### General Application Overview 
![Buttercup Tide Flowchart drawio](https://github.com/Muddykat-tech/buttercup-desktop-tide/assets/17131200/56c3d114-4c5e-47e6-8dd9-62eaf4fdd664)

Above is a rough flowchart detailing the function calls behind an attempt to create a vault using the Tide Datasource.

#### User Build Guide
To build this application yourself, simply clone the repository, in the root file run the following commmands:
Once cloned, make sure to install all dependencies: ```npm install```. After that, open 2 terminals and run ```npm run start:build``` on one, and then ```npm run start:main``` in the other.

For more involved delopment you may need to download and edit the following libraries:

[Buttercup Core](https://github.com/Muddykat-tech/buttercup-core-heimdall)
> Handles Vault Management, Most Cryptographic Functions 

[File Interface](https://github.com/Muddykat-tech/file-interface)
> Handles Interfacing with Datasource Clients and used in the 'Renderer' Section of this repository

[Buttercup Server](https://github.com/Amalsaju/buttercup-server)
> Contains the Server Client that is used in File Interface

[Buttercup Vault Database](https://github.com/Amalsaju/buttercup-vault-database)
> Contains the Dotnet Server Architecture used to store vaults

#### To Create an Executeable
Run the command:
```
npm run release
```
If you encounter issues with this command check the ```package.json``` as it contains the build information, depending on the operating system you are running you may need to edit this file.

**For more indepth Development information See main branch of [Buttercup](https://github.com/buttercup/buttercup-desktop/tree/master)**

