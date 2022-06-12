---
title: CLI 使用参考
---

[solvia-cli crate](https://crates.io/crates/solvia-cli) 为 Solvia 提供了一个命令行界面工具

## 示例：

### 获取公钥

```bash
// 命令
$solvia-keygen pubkey

// 返回
<PUBKEY>
```

### 空投 SOL/Lamports

```bash
// 命令
$ solvia airdrop 2

// 返回
"2.0000000 SOL"
```

### 获取余额

```bash
// 命令
$ solvia balance

// 返回
"3.00050001 SOL"
```

### 确认交易

```bash
// 命令
$ solvia confirm <TX_SIGNATURE>

// 返回
"Confirmed" / "Not found" / "Transaction failed with error <ERR>"
```

### 部署程序

```bash
// 命令
$ solvia deploy <PATH>

// 返回
<PROGRAM_ID>
```

## 使用方法
###
```text

```
