# Buttercup Desktop - Heimdall Implementation Branch

> See main Branch [Buttercup](https://github.com/buttercup/buttercup-desktop/tree/master)

## About
This branch changes a relativly small function of vault creation, in which in place of a master password you can create or unlock a vault using a Tide account, which removes the correlation of password strength and the vaults resistance against brute forcing.

For a general overview of the technology see the [Tide Protocol](https://tide.org/tideprotocol), for information on Heimdall see the [Public Repository](https://github.com/tide-foundation/heimdall)

### Practical Changes for the user
When creating or unlocking a vault inplace of the master password prompt is a login prompt for a Tide Account
![Tide Login](https://placehold.co/400x600)

Once you've logged in, that's it, you've secured the vault! 

This prompt also allows you to choose which servers you want to host the fragments of the private key used for the encryption and decyption process.<br>
![Tide Login With Server Selection Open](https://placehold.co/400x600)
