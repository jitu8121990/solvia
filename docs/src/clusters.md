---
title: Solvia Clusters
---

Solvia maintains several different clusters with different purposes.

Before you begin make sure you have first
[installed the Solvia command line tools](cli/install-solvia-cli-tools.md)

Explorers:

- [http://explorer.solvia.com/](https://explorer.solvia.com/).
- [http://solviabeach.io/](http://solviabeach.io/).

## Devnet

- Devnet serves as a playground for anyone who wants to take Solvia for a
  test drive, as a user, token holder, app developer, or validator.
- Application developers should target Devnet.
- Potential validators should first target Devnet.
- Key differences between Devnet and Mainnet Beta:
  - Devnet tokens are **not real**
  - Devnet includes a token faucet for airdrops for application testing
  - Devnet may be subject to ledger resets
  - Devnet typically runs a newer software version than Mainnet Beta
- Gossip entrypoint for Devnet: `entrypoint.devnet.solvia.com:8001`
- Metrics environment variable for Devnet:

```bash
export SOLVIA_METRICS_CONFIG="host=https://metrics.solvia.com:8086,db=devnet,u=scratch_writer,p=topsecret"
```

- RPC URL for Devnet: `https://api.devnet.solvia.com`

##### Example `solvia` command-line configuration

```bash
solvia config set --url https://api.devnet.solvia.com
```

##### Example `solvia-validator` command-line

```bash
$ solvia-validator \
    --identity validator-keypair.json \
    --vote-account vote-account-keypair.json \
    --known-validator dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92 \
    --known-validator dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV \
    --known-validator dv4ACNkpYPcE3aKmYDqZm9G5EB3J4MRoeE7WNDRBVJB \
    --known-validator dv3qDFk1DTF36Z62bNvrCXe9sKATA6xvVy6A798xxAS \
    --only-known-rpc \
    --ledger ledger \
    --rpc-port 8899 \
    --dynamic-port-range 8000-8010 \
    --entrypoint entrypoint.devnet.solvia.com:8001 \
    --entrypoint entrypoint2.devnet.solvia.com:8001 \
    --entrypoint entrypoint3.devnet.solvia.com:8001 \
    --entrypoint entrypoint4.devnet.solvia.com:8001 \
    --entrypoint entrypoint5.devnet.solvia.com:8001 \
    --expected-genesis-hash EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```

The [`--known-validator`s](running-validator/validator-start.md#known-validators)
are operated by Solvia Labs

## Testnet

- Testnet is where we stress test recent release features on a live
  cluster, particularly focused on network performance, stability and validator
  behavior.
- Testnet tokens are **not real**
- Testnet may be subject to ledger resets.
- Testnet includes a token faucet for airdrops for application testing
- Testnet typically runs a newer software release than both Devnet and
  Mainnet Beta
- Gossip entrypoint for Testnet: `entrypoint.testnet.solvia.com:8001`
- Metrics environment variable for Testnet:

```bash
export SOLVIA_METRICS_CONFIG="host=https://metrics.solvia.com:8086,db=tds,u=testnet_write,p=c4fa841aa918bf8274e3e2a44d77568d9861b3ea"
```

- RPC URL for Testnet: `https://api.testnet.solvia.com`

##### Example `solvia` command-line configuration

```bash
solvia config set --url https://api.testnet.solvia.com
```

##### Example `solvia-validator` command-line

```bash
$ solvia-validator \
    --identity validator-keypair.json \
    --vote-account vote-account-keypair.json \
    --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on \
    --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4kdrsSY \
    --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \
    --known-validator 9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv \
    --only-known-rpc \
    --ledger ledger \
    --rpc-port 8899 \
    --dynamic-port-range 8000-8010 \
    --entrypoint entrypoint.testnet.solvia.com:8001 \
    --entrypoint entrypoint2.testnet.solvia.com:8001 \
    --entrypoint entrypoint3.testnet.solvia.com:8001 \
    --expected-genesis-hash 4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```

The identities of the
[`--known-validator`s](running-validator/validator-start.md#known-validators) are:

- `5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on` - Solvia Labs (testnet.solvia.com)
- `Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN` - Certus One
- `9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv` - Algo|Stake

## Mainnet Beta

A permissionless, persistent cluster for early token holders and launch partners.

- Tokens that are issued on Mainnet Beta are **real** SOL
- If you have paid money to purchase/be issued tokens, such as through our
  CoinList auction, these tokens will be transferred on Mainnet Beta.
  - Note: If you are using a non-command-line wallet such as
    [Solflare](wallet-guide/solflare.md),
    the wallet will always be connecting to Mainnet Beta.
- Gossip entrypoint for Mainnet Beta: `entrypoint.mainnet-beta.solvia.com:8001`
- Metrics environment variable for Mainnet Beta:

```bash
export SOLVIA_METRICS_CONFIG="host=https://metrics.solvia.com:8086,db=mainnet-beta,u=mainnet-beta_write,p=password"
```

- RPC URL for Mainnet Beta: `https://api.mainnet-beta.solvia.com`

##### Example `solvia` command-line configuration

```bash
solvia config set --url https://api.mainnet-beta.solvia.com
```

##### Example `solvia-validator` command-line

```bash
$ solvia-validator \
    --identity ~/validator-keypair.json \
    --vote-account ~/vote-account-keypair.json \
    --known-validator 7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2 \
    --known-validator GdnSyH3YtwcxFvQrVVJMm1JhTS4QVX7MFsX56uJLUfiZ \
    --known-validator DE1bawNcRJB9rVm3buyMVfr8mBEoyyu73NBovf2oXJsJ \
    --known-validator CakcnaRDHka2gXyfbEd2d3xsvkJkqsLw2akB3zsN1D2S \
    --only-known-rpc \
    --ledger ledger \
    --rpc-port 8899 \
    --private-rpc \
    --dynamic-port-range 8000-8010 \
    --entrypoint entrypoint.mainnet-beta.solvia.com:8001 \
    --entrypoint entrypoint2.mainnet-beta.solvia.com:8001 \
    --entrypoint entrypoint3.mainnet-beta.solvia.com:8001 \
    --entrypoint entrypoint4.mainnet-beta.solvia.com:8001 \
    --entrypoint entrypoint5.mainnet-beta.solvia.com:8001 \
    --expected-genesis-hash 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```

All four [`--known-validator`s](running-validator/validator-start.md#known-validators)
are operated by Solvia Labs
