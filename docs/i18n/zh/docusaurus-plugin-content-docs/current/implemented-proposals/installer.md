---
title: 集群软件安装和更新
---

目前用户需要自己从git仓库中构建Solvia集群软件，并手动更新，容易出错且不方便。

本文档提出了一个简单易用的软件安装和更新程序，可以用来为支持的平台部署预建的二进制文件。 用户可以选择使用由Solvia或任何其他他们信任的方提供的二进制文件。 更新的部署是通过链上更新清单程序来管理的。

## 激励的例子

### 使用bootstrap curl/shell脚本获取并运行一个预构建的安装程序。

支持的平台上最简单的安装方法。

```bash
$ curl -sSf https://raw.githubusercontent.com/solvia-labs/solvia/v1.0.0/install/solvia-install-init.sh | sh
```

这个脚本将检查github以获取最新的标签版本，并从那里下载并运行`Solvia-install-init`二进制文件。

如果在安装过程中需要指定额外的参数，可以使用下面的shell语法。

```bash
$ init_args=.... # arguments for `solvia-install-init ...`
$ curl -sSf https://raw.githubusercontent.com/solvia-labs/solvia/v1.0.0/install/solvia-install-init.sh | sh -s - ${init_args}
```

### 从Github发布的版本中获取并运行一个预构建的安装程序。

通过知名的发布URL，可以获得支持平台的预构建二进制文件。

```bash
$ curl -o solvia-install-init https://github.com/solvia-labs/solvia/releases/download/v1.0.0/solvia-install-init-x86_64-apple-darwin
$ chmod +x ./solvia-install-init
$ ./solvia-install-init --help
```

### 从源代码构建并运行安装程序。

如果预制的二进制文件不能用于特定的平台，那么从源码中构建安装程序始终是一种选择。

```bash
$ git clone https://github.com/solvia-labs/solvia.git
$ cd solvia/install
$ cargo run -- --help
```

### 向集群部署新的更新。

如果Solvia发布的tarball\(由`ci/publish-tarball.sh`创建\) 已经上传到一个可公开访问的URL中，以下命令将部署更新。

```bash
$ solvia-keygen new -o update-manifest.json  # <-- only generated once, the public key is shared with users
$ solvia-install deploy http://example.com/path/to/solvia-release.tar.bz2 update-manifest.json
```

### 运行一个自动更新的验证器节点。

```bash
$ solvia-install init --pubkey 92DMonmBYXwEMHJ99c9ceRSpAmk9v6i3RdvDdXaVcrfj  # <-- pubkey is obtained from whoever is deploying the updates
$ export PATH=~/.local/share/solvia-install/bin:$PATH
$ solvia-keygen ...  # <-- runs the latest solvia-keygen
$ solvia-install run solvia-validator ...  # <-- runs a validator, restarting it as necesary when an update is applied
```

## 链上更新清单

更新清单用于在 Solvia 集群上宣传部署新版本的 tarballs。 更新清单使用 `config` 程序存储，每个更新清单账户描述了一个给定目标三倍的逻辑更新通道(例如，`x86_64-apple-darwin`)。 账户公钥在部署新更新的实体和消费这些更新的用户之间是众所周知的。

更新的压缩包本身在其他地方托管，不在链上，可以从指定的 `download_url` 获取。

```text
use solvia_sdk::signature::Signature;

/// Information required to download and apply a given update
pub struct UpdateManifest {
    pub timestamp_secs: u64, // When the release was deployed in seconds since UNIX EPOCH
    pub download_url: String, // Download URL to the release tar.bz2
    pub download_sha256: String, // SHA256 digest of the release tar.bz2 file
}

/// Data of an Update Manifest program Account.
#[derive(Serialize, Deserialize, Default, Debug, PartialEq)]
pub struct SignedUpdateManifest {
    pub manifest: UpdateManifest,
    pub manifest_signature: Signature,
}
```

请注意，`manifest` 字段本身包含一个相应的签名\(`manifest_signature`\)，以防止 `solvia-install` 工具和 Solvia 集群 RPC API 之间的中间人攻击。

为了防止回滚攻击，`solvia-install` 将拒绝安装比当前安装的 `timestamp_secs` 更早的更新。

## 版本存档内容

一个发行版的归档文件应该是一个用bzip2压缩的tar文件，其内部结构如下： /version. yml - 一个简单的YAML文件，包含"target"字段。

- `/version.yml` - 一个简单的YAML文件，包含 `"target"` -

  目标元组。 任何额外的字段将被忽略。

- `/bin/` -- 发行版中包含可用程序的目录。

  `solvia-install` 会将这个目录以符号链接的方式连接到

  `~/.local/share/Solvia-install/bin` 供 `PATH` 环境变量使用。

  变量。

- `...` -- 允许有任何其他文件和目录。

## solvia-install 工具

用户使用 `solvia-install` 工具来安装和更新他们的集群软件。

它在用户的主目录中管理以下文件和目录： ~/. config/Solvia/install/config. yml -- 用户配置和当前集群软件的信息。

- `~/.config/Solvia/install/config.yml` - 用户配置和当前安装的软件版本信息。
- `~/.local/share/solvia/install/bin` - 当前版本的符号链接， 例如，`~/.local/share/Solvia-update/<update-pubkey>-<manifest_signature>/bin`。
- `~/.local/share/Solvia/install/releases/<download_sha256>/` - 版本内容。

### 命令行界面

```text
solvia-install 0.16.0
The solvia cluster software installer

USAGE:
    solvia-install [OPTIONS] <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -c, --config <PATH>    Configuration file to use [default: .../Library/Preferences/solvia/install.yml]

SUBCOMMANDS:
    deploy    deploys a new update
    help      Prints this message or the help of the given subcommand(s)
    info      displays information about the current installation
    init      initializes a new installation
    run       Runs a program while periodically checking and applying software updates
    update    checks for an update, and if available downloads and applies it
```

```text
solvia-install-init
initializes a new installation

USAGE:
    solvia-install init [OPTIONS]

FLAGS:
    -h, --help    Prints help information

OPTIONS:
    -d, --data_dir <PATH>    Directory to store install data [default: .../Library/Application Support/solvia]
    -u, --url <URL>          JSON RPC URL for the solvia cluster [default: http://api.devnet.solvia.com]
    -p, --pubkey <PUBKEY>    Public key of the update manifest [default: 9XX329sPuskWhH4DQh6k16c87dHKhXLBZTL3Gxmve8Gp]
```

```text
solvia-install info
displays information about the current installation

USAGE:
    solvia-install info [FLAGS]

FLAGS:
    -h, --help     Prints help information
    -l, --local    only display local information, don't check the cluster for new updates
```

```text
solvia-install deploy
deploys a new update

USAGE:
    solvia-install deploy <download_url> <update_manifest_keypair>

FLAGS:
    -h, --help    Prints help information

ARGS:
    <download_url>               URL to the solvia release archive
    <update_manifest_keypair>    Keypair file for the update manifest (/path/to/keypair.json)
```

```text
solvia-install update
checks for an update, and if available downloads and applies it

USAGE:
    solvia-install update

FLAGS:
    -h, --help    Prints help information
```

```text
solvia-install run
Runs a program while periodically checking and applying software updates

USAGE:
    solvia-install run <program_name> [program_arguments]...

FLAGS:
    -h, --help    Prints help information

ARGS:
    <program_name>            program to run
    <program_arguments>...    arguments to supply to the program

The program will be restarted upon a successful software update
```
