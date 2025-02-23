---
title: 账本复制
---

注意：此账本复制解决方案已部分实施，但尚未完成。 为了防止未使用代码的安全风险，https://github.com/solvia-labs/solvia/pull/9992 删除了部分实现。 本设计文档的第一部分反映了账本复制的已实现部分。 [本章节的第二部分](#ledger-replication-not-implemented) 描述了解决方案中尚未实现的部分。

## 复制证明

在1gbps的网络上满负荷运行时，solvia每年将产生4PB的数据。 为了防止网络过于集中在存储完整数据库的验证节点，该协议提出了一种挖掘节点为数据片段提供存储容量的方法。

复制证明的基本思想为 CBC 加密，使用公共对称密钥加密数据集，然后对加密的数据集进行哈希处理。 原始方法的主要问题在于，不诚实的存储节点会流式传输加密，对数据进行哈希处理时将其删除。 一种简单的解决方案是根据带符号的PoH值定期重新生成哈希。 这确保了在生成证明期间所有数据都存在，并且还要求验证节点拥有完整的加密数据，以验证每个身份的每个证明。 因此，验证所需的空间为 `number_of_proofs*data_size`。

## 使用 PoH 进行优化

我们对这种方法的改进是随机取样加密区段，这样比加密算法本身还快， 并将这些采样的哈希值记录到PoH账本中。 因此，每个 PoRep 片段保持完全相同的顺序，并且验证可以在单个批次中流传输数据，验证所有的证明。 这样，我们可以同时验证多个证明，每个证明都在其自己的 CUDA 内核上。 验证所需的总空间为`1_ledger_segment + 2_cbc_blocks * number_of_identities`，核心计数等于`number_of_identities`。 我们使用 64 字节的缓存 CBC 区块大小。

## 网络

PoRep 验证节点与验证交易的验证节点相同。 如果归档器可以证明验证节点验证了伪造的 PoRep，那么验证节点就不会收到该存储 epoch 的奖励。

归档器（Archiver）是专门的_轻客户端_。 他们下载一部分账本\(也称为 Segment\) 并存储起来，同时提供存储账本的PoRep。 对于每个经过验证的 PoRep 归档器，均可从矿池中获得 sol 奖励。

## 约束因素

我们面临以下的限制：

- 验证需要生成 CBC 区块。 对于同一数据集的每个身份，

  它就需要 2 个区块和 1 个 CUDA 内核。 这样，

  许多身份可以一次性将这些证据

  添加到批处理中同一数据集验证的身份。

- 验证节点将随机抽取一组存储证明，

  来证明他们可以处理，并且只有那些选择的证明创建者

  才能获得奖励。 只要验证节点的硬件配置成功，它就可以运行基准测试

  进行更改以确定可以验证存储证明的速率。

## 验证和复制协议

### 常量

1. SLOTS_PER_SEGMENT：账本数据段的插槽数。 .

   此存档器的存储单位。

2. NUM_KEY_ROTATION_SEGMENTS：归档器之后的段数

   重新生成其加密密钥并选择要存储的新数据集。

3. NUM_STORAGE_PROOFS：存储证明所需的存储证明数量

   成功获得了奖励。

4. RATIO_OF_FAKE_PROFS：存储的伪造证明与真实证明的比率

   挖矿证明要求必须包含有效的奖励。

5. NUM_STORAGE_SAMPLES：存储挖掘所需的样本数证明。

   .

6. NUM_CHACHA_ROUNDS：执行生成加密状态的数量。

   .

7. NUM_SLOTS_PER_TURN：定义单个存储epoch或 PoRep “回转”

   的插槽数。

### 验证节点行为

1. 验证节点加入网络，并开始在每个存储epoch/变化边界中

   寻找归档器帐户。

2. 每一轮，验证程序在边界处签名 PoH 值并使用该签名

   从 epoch 边界中找到的每个存储帐户中随机选择要验证的证据。

   此签名的值也将提交到验证节点的存储帐户，并将由

   归档器在稍后阶段进行交叉验证。

3. 验证节点在每个 `NUM_SLOTS_PER_TURN` 插槽中公布 PoH 值。 这个值

   也可以通过RPC接口提供给存档器。

4. 对于给定的 N 轮，所有验证都将被锁定，直到 N+3 轮(间隔为 2 轮/epoch) 为止。

   此时，该epoch中的所有验证都可用于奖励收集。

5. 在两次转换之间将标记任何不正确的验证。

### 归档器行为

1. 由于存档器有点像轻量级客户端，因此不会下载所有的账本数据，

   他们必须依靠其他验证节点和归档器来获取信息。

   尽管给定的验证节点可能是恶意软件，也可能不是恶意软件，

   并且给出的信息不正确，除了拥有存档器会做额外的浪费工作。

   . 对于许多操作，许多选项取决于

   归档器的偏离程度：

   - \(a\) 归档器可以要求验证节点
   - \(b\) 归档器可以询问多个验证节点
   - \(c\) 归档器可以询问其他归档器
   - \(d\) 存档器可以订阅完整的事务流并生成信息

     \(假定插槽已经是最新的\)

   - \(e\) 归档器可以订阅一个简短的交易流

     \(假定插槽已经是最新的\)

2. 归档器使用其插槽获取与最后一个epoch相对应的PoH哈希。
3. 归档器使用其密钥对对PoH哈希进行签名。 该签名是种子，

   用于选择要复制的段以及加密密钥。 .

   存档器使用插槽修改签名以获取要分段的部分复制。

   .

4. 归档器通过询问对等验证节点和归档器。

   . 参见6.5。

5. 然后，归档程序使用chacha算法用密钥对该段进行加密。

   在CBC模式下，加密方式为`NUM_CHACHA_ROUNDS`。

6. 存档器使用签名的最近PoH值初始化种子。

   .

7. 归档程序会在以下范围内生成`NUM_STORAGE_SAMPLES`个样本条目，

   并使用sha256对加密的段分别采样32个字节偏移值。

   . 采样状态应该比生成加密的状态更快。

   .

8. 存档器发送包含其sha状态的PoRep证明交易在采样操作结束时，

   将其种子和用于采样的样本当前的领导者，

   并将其放到账本中。

9. 在给定的epoch中，归档器应针对同一段提交许多证明

   并且基于`RATIO_OF_FAKE_PROOFS`，其中一些证明必须是伪造的。

10. 当PoRep游戏进入下一epoch时，

    归档器必须提交一个在最后一轮交易中戴上伪造的mask。 这笔交易

    将定义对归档器和验证节点的奖励。

11. 最后对于一个轮 N，随着PoRep游戏进入 N+3 轮，

    归档器的证明将计入其奖励。

### PoRep 游戏（Game）

复制证明游戏有四个主要阶段。 对于每一“轮”，都有多个 PoRep 游戏，但每个游戏处于不同的阶段。

PoRep 游戏的四个阶段如下：

1. 证明提交阶段
   - 归档器：在此阶段提交尽可能多的证明
   - 验证节点：无操作
2. 验证阶段
   - 存档器：无操作
   - 验证节点：选择归档器并从上一轮验证他们的证明
3. 证明挑战阶段
   - 归档器：提交带有证明理由的证明蒙版(对于2轮前提交的伪造证明)
   - 验证节点：无操作
4. 奖励收集阶段
   - 归档器：收集3轮前的奖励
   - 验证节点：3轮之前收集奖励

对于PoRep游戏的每一轮，验证节点和归档器都会评估每个阶段。 这些阶段作为独立的事务在存储程序上运行。

### 找出谁有账本的给定区块

1. 验证节点监视PoRep游戏中的变化，并查看植根的账本

   依次寻找任何证明的边界。

2. 验证节点维护账本段和相应的归档器公共密钥的映射。

   当验证节点处理段的归档器的证明时，映射将更新。

   验证节点提供了一个RPC接口来访问此映射。 使用此API，

   客户端可以将段映射到归档器的网络地址(通过cluster_info表进行关联)。

   然后，客户端可以将修复请求发送到存档器以检索段。

3. 验证节点需要每N轮使此列表无效。

## 女巫攻击

对于任何随机种子，我们强迫所有人使用从轮次边界处的PoH哈希派生的签名。 每个人都使用相同的计数，因此每个参与者都签名相同的PoH哈希。 然后，每个签名都加密绑定到密钥对，这可以防止领导者根据超过1个身份的结果值进行挖矿。

由于除了加密身份之外，还有更多的客户端身份，因此我们需要为多个客户端分配奖励，并防止Sybil攻击生成许多客户端来获取相同的数据块。 为了保持BFT，我们要避免单个实体存储账本某一个区块的所有副本。

我们对此的解决方案是强制客户端继续使用相同的身份。 如果第一轮用于获取许多客户端身份的相同区块，则第二轮对相同客户端身份强制重新分配签名，从而强制重新分配PoRep身份和块。 因此，要获得对归档器的奖励，需要免费存储第一个区块，并且网络可以奖励长期存在的客户端身份，而不是奖励一个新身份。

## 验证节点攻击

- 如果验证节点批准了伪造的证明，则归档器可以通过以下方式轻松地将其剔除：

  显示哈希的初始状态。

- 挖矿如果验证节点将真实证明标记为伪造，

  则无法进行链上计算区分谁是正确的。 奖励必须依赖于多个验证节点，

  以阻止不良演员和归档器获得被拒绝的奖励。

- 挖矿验证程序本身会窃取挖矿证明结果。 证明是推导的来自归档器的签名，

  因为验证节点

  不知道用于生成加密密钥的私钥，

  它不能是证明本身。

## 奖励措施

伪造证明的生成非常容易，但难以验证。 因此，由归档器生成的PoRep证明交易可能需要比正常交易更高的费用，才能代表验证节点所需的计算成本。

为了从存储挖矿中获得奖励，还需要一定比例的伪造证据。

## 注意事项

- 通过使用PoH，我们可以减少PoRep验证的费用，实际上

  使验证全局数据集的大量证明变得可行。

- 我们可以通过强制每个人都签名相同的PoH哈希和

  使用签名作为种子

- 验证节点和归档器之间的博弈超过随机块和随机数

  加密身份和随机数据样本。 随机化的目标是

  防止共谋组在数据或验证上重叠。

- 存档客户通过提交伪造的证明来寻找懒惰的验证节点

  他们可以证明是假的。

- 为了防御试图存储同一区块的Sybil客户身份，

  我们强迫客户在获得奖励之前先进行多轮存储。

- 验证节点还应通过验证提交的存储证明而获得奖励

  作为存储账本的诱因。 他们只能验证证明，如果他们

  正在存储一部分该账本。

# 账本复制未实现部分

复制行为尚未实现的部分。

## 存储 epoch

存储时期应为插槽数，这将导致生成大约100GB1TB的账本，以供归档器存储。 当给定的分叉极有可能无法回滚时，归档器将开始存储账本。

## 验证节点行为

1. 每个NUM_KEY_ROTATION_TICKS也会验证从以下位置收到的样本

   归档器。 它在那时签署PoH哈希并使用以下内容以签名为输入的算法：

   .

   - 签名的第一个字节的低5位将创建一个索引签名的另一个起始字节。

     .

   - 验证节点然后查看存储证明集，其中从低字节开始的证明的sha状态向量完全匹配与所选的签名字节。

     .

     ()

   - 如果证明集大于验证节点可以处理的范围，则证明在签名中增加到匹配2个字节。

     .

   - 验证程序将继续增加匹配字节的数量，

     直到出现找到了可行的集合。

   - 然后创建有效证明和伪造证明的掩码，

     并将其发送给领导人。 这是一个存储证明确认交易。

2. 在NUM_SECONDS_STORAGE_LOCKOUT秒的锁定期后，

   验证节点然后提交存储证明索赔交易，

   然后导致如果没有发现挑战的证据，

   则分配存储奖励验证节点和归档器参与证明。

## 归档器行为

1. 然后，存档器生成另一组偏移量，它会提供一个伪造的偏移量。

   . 提供种子的哈希结果可以证明它是伪造的。

   .

   - 伪造证明应包括 PoH 签名的归档器哈希价值。

     . 这样，当归档器揭露虚假证据时，就可以在链上验证。

     .

2. 归档器监视账本，如果发现集成了伪造的证明，

   它将创建一个挑战交易并将其提交给当前的领导者。 .

   这事务处理证明验证节点错误地验证了伪造的存储证明。

   归档器得到奖励，验证节点的质押余额被罚没或冻结。

   .

## 存储合约逻辑证明

每个存档器和验证节点将拥有自己的存储帐户。 验证节点的帐户将与他们的投票帐户类似，而不是其八卦 id。 这些应作为两个程序实现，一个程序将验证程序作为密钥签名者，另一个程序作为存档程序。 这样，当程序引用其他帐户时，他们可以检查程序ID，以确保该程序是他们正在引用的验证节点或归档器帐户。

### SubmitMiningProof

```text
SubmitMiningProof {
    slot: u64,
    sha_state: Hash,
    signature: Signature,
};
keys = [archiver_keypair]
```

归档器在为特定的哈希值挖掘其存储的账本数据后创建这些文件。 该插槽是它们要存储的账本段的末尾插槽，使用哈希函数对归档器的结果进行sha_state声明，以对其加密的账本段进行采样。 签名是在他们为当前存储时期签名PoH值时创建的签名。 当前存储纪元的证明清单应保存在帐户状态，然后在纪元过去时转移到上一个纪元的证明清单。 在给定的存储时间段内，给定的归档器应仅提交一个分段的证明。

该程序应具有一个插槽列表，这些插槽是有效的存储挖矿插槽。 应当通过跟踪作为根目录的插槽的插槽来维护此列表，在这些插槽中，网络的重要部分已经投票，具有较高的锁定值（可能是32投票权的旧版本）。 每个SLOTS_PER_SEGMENT个插槽数都将添加到该集合中。 程序应检查插槽是否在此集中。 可以通过接收AdvertiseStorageRecentBlockHash并检查其bank/TowerBFT状态来维护该集。

该程序应该对签名，来自事务提交者的公钥以及先前存储纪元PoH值的消息进行签名验证检查。

### ProofValidation

```text
ProofValidation {
   proof_mask: Vec<ProofStatus>,
}
keys = [validator_keypair, archiver_keypair(s) (unsigned)]
```

验证节点将提交此交易，以表明给定细分的一组证明是有效/无效或在验证节点未查看的情况下被跳过。 应该在密钥中引用它所查看的归档器的密钥对，以便程序逻辑可以转到这些帐户，并查看证明是在前一个时期生成的。 应验证存储证明的采样，以确保验证节点根据采样的验证节点行为中概述的逻辑跳过正确的证明。

随附的存档器密钥将指示正在引用的存储样本；应该对照所引用的归档器帐户中的一组存储证明来验证proof_mask的长度，并且应与所述归档器(多个) 帐户状态下在先前存储时期中提交的证明数量相匹配。

### ClaimStorageReward

```text
ClaimStorageReward {
}
keys = [validator_keypair or archiver_keypair, validator/archiver_keypairs (unsigned)]
```

归档器和验证节点将使用此事务从程序状态获取已支付的令牌，在该程序状态中，SubmitStorageProof，ProofValidation和ChallengeProofValidation处于已提交并验证了证明的状态，并且没有ChallengeProofValidations引用这些证明。 对于验证节点，它应该在相关纪元中引用已验证其证据的存档器密钥对。 对于归档器，它应该引用已验证并希望获得奖励的验证节点密钥对。

### ChallengeProofValidation

```text
ChallengeProofValidation {
    proof_index: u64,
    hash_seed_value: Vec<u8>,
}
keys = [archiver_keypair, validator_keypair]
```

此事务用于捕获没有进行验证工作的懒惰验证节点。 当看到验证节点批准了假的SubmitMiningProof事务时，归档器将提交此事务。 由于存档器是轻量级客户端，而不是查看整个区块链，因此可能必须通过RPC调用向验证节点或一组验证节点询问此信息，以获取上一个存储时期中某个段的所有ProofValidation。 该程序将查看验证节点帐户状态，查看是否在上一个存储纪元中提交了ProofValidation并对hash_seed_value进行哈希处理，并看到哈希值与SubmitMiningProof事务匹配，并且验证节点将其标记为有效。 如果是这样，那么它将把挑战保存到其状态下的挑战列表中。

### AdvertiseStorageRecentBlockhash

```text
AdvertiseStorageRecentBlockhash {
    hash: Hash,
    slot: u64,
}
```

验证节点和归档器将提交此消息，以指示新的存储纪元已经过去，并且作为当前的存储证据现在应作为前一个纪元的存储证明。 其他事务应检查，来确保在当前的区块链状态下，它们所引用的纪元是正确的。
