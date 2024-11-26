# 🎬 Movie Protocol

A decentralized streaming platform built on Solana blockchain

[![Solana](https://img.shields.io/badge/Solana-Devnet-green)](https://explorer.solana.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[Demo](https://solana-movie-ca9567w87-sineus-projects.vercel.app/) • [Documentation](#documentation) • [Installation](#installation)

</div>

## 📝 Overview

Movie Protocol is revolutionizing content distribution by enabling publishers to manage and monetize films directly on the Solana blockchain.

### Key Features

- 🎯 **Smart Contract Management**
 - Add movies via PDAs (Program Derived Addresses)
 - Edit metadata and ownership rights
 - Secure transfer system

- 💰 **Tokenomics**
 - MOVIE token (SPL) for transactions
 - Automated royalty distribution
 - Staking rewards system (planned)

## Architecture

The infrastructure is built on the Solana blockchain and uses:
- PDAs for secure movie storage
- MOVIE token (SPL) for transactions
- Smart contracts for rights and royalty management

## 🗺 Roadmap

### Phase 1 ✅
- [x] Publisher management system
- [x] Core PDA infrastructure
- [x] Secure rights transfers

### Phase 2 🚧
- [ ] Viewer interface
- [ ] MOVIE token integration
- [ ] Royalty distribution

### Phase 3 📋
- [ ] Staking programs
- [ ] Token incentives
- [ ] Ecosystem expansion

## Vision

Create a decentralized streaming ecosystem where publishers and viewers interact directly, with transparent revenue distribution through the Solana blockchain.

## Project Status

The protocol is currently running on Solana devnet during Phase 2 development.

## How to install build and test application locally
To build, please execute this command inside the anchor_project folder
```sh
    anchor build
```
To test, please execute this command inside the anchor_project folder
```sh
    anchor test
```
Don't forget to set solana network to localhost
```sh
    solana config set -u localhost
```

Then, you can launch the frontend application (NextJS) with (in frontend folder)
```sh
    yarn dev
```
To deploy the application, you can execute this
```sh
    yarn run vercel build
    yarn run vercel deploy --prebuilt
```

The application will be accessible at localhost:3000

>[!CAUTION]
>The application works exclusively with Phantom actually, but in the futur, I will add other wallet.