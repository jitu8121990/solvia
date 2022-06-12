---
title: Rust API
---

Solvia's Rust crates are [published to crates.io][crates.io] and can be found
[on docs.rs with the "solvia-" prefix][docs.rs].

[crates.io]: https://crates.io/search?q=solvia-
[docs.rs]: https://docs.rs/releases/search?query=solvia-

Some important crates:

- [`solvia-program`] &mdash; Imported by programs running on Solvia, compiled
  to BPF. This crate contains many fundamental data types and is re-exported from
  [`solvia-sdk`], which cannot be imported from a Solvia program.

- [`solvia-sdk`] &mdash; The basic off-chain SDK, it re-exports
  [`solvia-program`] and adds more APIs on top of that. Most Solvia programs
  that do not run on-chain will import this.

- [`solvia-client`] &mdash; For interacting with a Solvia node via the
  [JSON RPC API](jsonrpc-api).

- [`solvia-clap-utils`] &mdash; Routines for setting up a CLI, using [`clap`],
  as used by the main Solvia CLI.

[`solvia-program`]: https://docs.rs/solvia-program
[`solvia-sdk`]: https://docs.rs/solvia-sdk
[`solvia-client`]: https://docs.rs/solvia-client
[`solvia-clap-utils`]: https://docs.rs/solvia-clap-utils
[`clap`]: https://docs.rs/clap
