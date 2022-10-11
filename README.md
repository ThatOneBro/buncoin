![buncoin-logo-1](https://user-images.githubusercontent.com/1592008/195040496-4fc234f3-077e-458e-b83b-51217acb5931.png)
<h1 align=center>BunCoin</h1>
<div align=center>A cryptocurrency network made for the Bun ecosystem</div>

<br />

## Project Brief

I decided to work on this project in order to dust off the decaying knowledge about cryptography and decentralized networks I have gathered over the years as well as create the start of a bleeding edge showcase for the Bun runtime. It had been way too long since I had been able to really leverage my crypto knowledge in a meaningful way, and I knew that it could also push the boundaries for what Bun is currently capable of as well as demo how much better it can be than the aging Node.js environment.

There is a lot missing from the current Bun runtime -- these are early days for the project -- but already Bun proves to be a very promising runtime for the future of highly performant and modern server-side (or serverless) JavaScript and TypeScript. Cryptocurrency networks are complicated and require a lot of optimizations to run efficiently, especially at scale, and that's why I picked this project to serve as a testament to the early functionality of Bun as well as a history of its future growth; one which will be easily identifiable as a phenomenal exhibition of performance and ergonomics alike, and one that **may** have some marginal utility as a cool demo at worst and **may** be a fun way to get people involved in the Bun community at best.

## Goals

- Demonstrate the technical potential of the Bun runtime
- Serve as a large collaborative project to encourage community growth within the Bun project
- Create a fun, interactive, always-on demo that can be both engaging and educational for those looking to learn about Bun

## Some Technical Ramblings

Currently a lot is up in the air about what BunCoin will do and what it will be used for. These undecided functional use cases of BunCoin will undoubtedly influence the protocols chosen for the BunCoin network. Right now I'm leaning towards a simple consensus protocol like the [Avalanche consensus protocol](https://docs.avax.network/overview/getting-started/avalanche-consensus), except I would prefer it be a blockchain-based system rather than a DAG-based system, simply to keep the surface area and complexity of the project smaller.

There are also other things to consider, like sharding the network state to create a more scalable system, however in order to keep things a lot simpler from the beginning, I would like to consider ways to compress old network state and remove it from the main chain in order to reduce the storage space required for all nodes, while simultaneously allowing users to prove past transactions with some kind of cryptographic receipt (if possible).

Something like this may be possible by allowing users to request current validators to sign off on the receipt of a soon-expiring transaction, however the fact that the validators were in the network at that given point in time (validators may leave later or may not have been part of the network in time to be able to sign off on such a receipt), or some kind of staking, must be done to prevent fraudulent receipts from being created.

Since a lot of these things are still uncertain, and should even probably be subject to frequent change in the early days, a network-wide automatic upgrade system should probably be implemented, to make sure the whole network upgrades simultaneously, or nodes who refuse to upgrade cleanly fork off into their own network, though the upgrade system should be opt-out rather than opt-in.

More info will be available about these things later after I complete the respective architecture documents for each.

## TODO

Here are a few things that are planned to be done; this list is mostly for myself until I can get the core of the project organized.

- [x] Create a description of the goals of BunCoin
- [ ] Create the basic loop of a cryptographically secure public message protocol
  - [ ] Create the message interchange format with signature and signature verification
  - [ ] Create the protocol for joining the network and telling nodes about your node ID
  - [ ] Create the protocol for leaving the network (?) [will depend on the consensus protocol if this is important]
- [ ] Decide on the technicals of network data structure and consensus
  - [ ] Should it be a blockchain, DAG?
  - [ ] Avalanche consensus? Some other consensus?
  - [ ] Identity problem -- should people be required to make at least one PR to a Bun related repo to become a validator? Or should we create a completely bootstrapped trust system?
- [ ] Create a brief architecture document for the BunCoin node
- [ ] Create a brief architecture document for the BunCoin network
- [ ] Create a project for BunCoin tasks
- [ ] Create the basic loop of network consensus
- [x] Create a todo list regarding BunCoin and what I need to work on
- [x] Remove linking hack to allow for proper linking across all OSes
- [ ] Cross-compile libsodium for ease of installation?
