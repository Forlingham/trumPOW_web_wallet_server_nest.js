-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Address_address_key`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UTXO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `txid` VARCHAR(191) NOT NULL,
    `vout` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(18, 8) NOT NULL,
    `scriptPubKey` VARCHAR(512) NOT NULL,
    `isSpent` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UTXO_address_idx`(`address`),
    UNIQUE INDEX `UTXO_txid_vout_key`(`txid`, `vout`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `txid` VARCHAR(191) NOT NULL,
    `blockHeight` INTEGER NOT NULL,
    `blockHash` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Transaction_txid_key`(`txid`),
    INDEX `Transaction_blockHeight_idx`(`blockHeight`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndexerState` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `singleton` VARCHAR(191) NOT NULL DEFAULT 'indexer',
    `lastProcessedBlock` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `IndexerState_singleton_key`(`singleton`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `db_userList` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `address` CHAR(45) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `db_userList_id_key`(`id`),
    UNIQUE INDEX `db_userList_address_key`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `db_coinPrise` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `price` DECIMAL(30, 8) NOT NULL DEFAULT 0,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `db_coinPrise_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `db_blockChainInfo` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `chain` VARCHAR(20) NOT NULL,
    `blocks` INTEGER UNSIGNED NOT NULL,
    `headers` INTEGER UNSIGNED NOT NULL,
    `bestblockhash` CHAR(64) NOT NULL,
    `difficulty` DECIMAL(30, 8) NOT NULL,
    `time` INTEGER UNSIGNED NOT NULL,
    `mediantime` INTEGER UNSIGNED NOT NULL,
    `verificationprogress` DECIMAL(30, 8) NOT NULL,
    `initialblockdownload` BOOLEAN NOT NULL,
    `chainwork` CHAR(64) NOT NULL,
    `size_on_disk` INTEGER UNSIGNED NOT NULL,
    `pruned` BOOLEAN NOT NULL,
    `warnings` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `db_blockChainInfo_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `db_sendRawTransaction` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `address` CHAR(45) NOT NULL,
    `txid` CHAR(64) NOT NULL,
    `rawtx` TEXT NOT NULL,
    `totalInput` DECIMAL(30, 8) NOT NULL,
    `totalOutput` DECIMAL(30, 8) NOT NULL,
    `change` DECIMAL(30, 8) NOT NULL,
    `feeRate` DECIMAL(30, 8) NOT NULL,
    `appFee` DECIMAL(30, 8) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `db_sendRawTransaction_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TransactionAddresses` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TransactionAddresses_AB_unique`(`A`, `B`),
    INDEX `_TransactionAddresses_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UTXO` ADD CONSTRAINT `UTXO_address_fkey` FOREIGN KEY (`address`) REFERENCES `Address`(`address`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TransactionAddresses` ADD CONSTRAINT `_TransactionAddresses_A_fkey` FOREIGN KEY (`A`) REFERENCES `Address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TransactionAddresses` ADD CONSTRAINT `_TransactionAddresses_B_fkey` FOREIGN KEY (`B`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
