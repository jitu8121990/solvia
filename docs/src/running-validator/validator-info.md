---
title: Publishing Validator Info
---

You can publish your validator information to the chain to be publicly visible to other users.

## Run solvia validator-info

Run the solvia CLI to populate a validator info account:

```bash
solvia validator-info publish --keypair ~/validator-keypair.json <VALIDATOR_INFO_ARGS> <VALIDATOR_NAME>
```

For details about optional fields for VALIDATOR_INFO_ARGS:

```bash
solvia validator-info publish --help
```

## Example Commands

Example publish command:

```bash
solvia validator-info publish "Elvis Validator" -n elvis -w "https://elvis-validates.com"
```

Example query command:

```bash
solvia validator-info get
```

which outputs

```text
Validator info from 8WdJvDz6obhADdxpGCiJKZsDYwTLNEDFizayqziDc9ah
  Validator pubkey: 6dMH3u76qZ7XG4bVboVRnBHR2FfrxEqTTTyj4xmyDMWo
  Info: {"keybaseUsername":"elvis","name":"Elvis Validator","website":"https://elvis-validates.com"}
```

## Keybase

Including a Keybase username allows client applications \(like the Solvia
Network Explorer\) to automatically pull in your validator public profile,
including cryptographic proofs, brand identity, etc. To connect your validator
pubkey with Keybase:

1. Join [https://keybase.io/](https://keybase.io/) and complete the profile for your validator
2. Add your validator **identity pubkey** to Keybase:

   - Create an empty file on your local computer called `validator-<PUBKEY>`
   - In Keybase, navigate to the Files section, and upload your pubkey file to

     a `solvia` subdirectory in your public folder: `/keybase/public/<KEYBASE_USERNAME>/solvia`

   - To check your pubkey, ensure you can successfully browse to

     `https://keybase.pub/<KEYBASE_USERNAME>/solvia/validator-<PUBKEY>`

3. Add or update your `solvia validator-info` with your Keybase username. The

   CLI will verify the `validator-<PUBKEY>` file
