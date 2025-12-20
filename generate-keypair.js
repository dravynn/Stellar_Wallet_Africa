const StellarSdk = require('@stellar/stellar-sdk');
const fetch = require('node-fetch');

async function main() {
  // Generate a random keypair
  const keypair = StellarSdk.Keypair.random();

  console.log("Public Key:", keypair.publicKey());
  console.log("Secret Key:", keypair.secret());

  // Fund the account on testnet
  const publicKey = keypair.publicKey();
  const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);

  if (response.ok) {
    console.log("Account successfully funded!");
  }

  // Load the account from Horizon
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(publicKey);

  console.log("Balances for account:", publicKey);
  account.balances.forEach(balance => {
    console.log("Type:", balance.asset_type, "Balance:", balance.balance);
  });

  // Create a payment transaction
  // Generate a destination keypair for demonstration
  const destinationKeypair = StellarSdk.Keypair.random();
  const destinationPublicKey = destinationKeypair.publicKey();
  const sourcePublicKey = publicKey;
  const sourceKeypair = keypair;

  console.log("\nCreating payment transaction to:", destinationPublicKey);

  const sourceAccount = await server.loadAccount(sourcePublicKey);

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: "100000"
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: destinationPublicKey,
      asset: StellarSdk.Asset.native(),
      amount: "10" // Amount in XLM
    }))
    .setTimeout(300)
    .build();

  // Convert transaction to XDR format
  const txXDR = transaction.toXDR();
  console.log("\nTransaction XDR (can be shared with other parties):");
  console.log(txXDR);
  // Send this XDR string to other parties
  
  // Reconstruct transaction from XDR (useful for multi-signature scenarios)
  console.log("\n=== Reconstructing Transaction from XDR ===");
  const reconstructedTx = new StellarSdk.Transaction(txXDR, StellarSdk.Networks.TESTNET);
  
  // Sign the reconstructed transaction
  reconstructedTx.sign(sourceKeypair);
  
  // Extract the signature
  const signature = reconstructedTx.signatures[0];
  console.log("Signature extracted from transaction:");
  console.log("Signature hint:", signature.hint().toString('hex'));
  console.log("Signature value length:", signature.signature().length, "bytes");

  // Add signature to a transaction (useful for multi-signature workflows)
  console.log("\n=== Adding Signature to Transaction ===");
  const txForMultiSig = new StellarSdk.Transaction(txXDR, StellarSdk.Networks.TESTNET);
  const signerPublicKey = sourceKeypair.publicKey();
  const signatureString = signature.signature().toString('base64');
  
  // Add the signature to the transaction
  txForMultiSig.addSignature(signerPublicKey, signatureString);
  console.log("Signature added to transaction for public key:", signerPublicKey);
  console.log("Transaction now has", txForMultiSig.signatures.length, "signature(s)");

  // Get signature hints for multiple public keys
  console.log("\n=== Getting Signature Hints for Public Keys ===");
  
  // Some predefined list of public keys (or all affected accounts in transaction)
  const somePredefinedList = [
    sourceKeypair.publicKey(),
    destinationKeypair.publicKey(),
    StellarSdk.Keypair.random().publicKey()
  ];
  
  console.log("Public keys to get hints for:");
  const signatureHints = {};
  
  for (const pubKey of somePredefinedList) {
    const hint = StellarSdk.Keypair.fromPublicKey(pubKey).signatureHint();
    signatureHints[pubKey] = hint;
    console.log(`Public Key: ${pubKey}`);
    console.log(`  Signature Hint: ${hint.toString('hex')}`);
  }
  
  // Also get hints from all signers in the transaction
  console.log("\nSignature hints from transaction signers:");
  for (const sig of transaction.signatures) {
    const hint = sig.hint();
    console.log(`  Hint: ${hint.toString('hex')}`);
  }

  // Iterate through transaction signatures using index
  console.log("\n=== Iterating Transaction Signatures by Index ===");
  const tx = new StellarSdk.Transaction(txXDR, StellarSdk.Networks.TESTNET);
  
  // Sign the transaction first to have signatures
  tx.sign(sourceKeypair);
  
  console.log("Transaction has", tx.signatures.length, "signature(s)");
  for (let n in tx.signatures) {
    const hint = tx.signatures[n].hint();
    console.log(`Signature ${parseInt(n) + 1} hint:`, hint.toString('hex'));
  }

  // Sign the original transaction
  transaction.sign(sourceKeypair);

  // Submit to the network
  try {
    const result = await server.submitTransaction(transaction);
    console.log("Transaction successful! Hash:", result.hash);
  } catch (error) {
    console.error("Transaction failed:", error);
  }

  // Create a new account transaction
  const newAccountKeypair = StellarSdk.Keypair.random();
  const newAccountPublicKey = newAccountKeypair.publicKey();
  
  console.log("\nCreating new account:", newAccountPublicKey);
  
  // Reload source account to get updated sequence number
  const updatedSourceAccount = await server.loadAccount(sourcePublicKey);
  
  const createAccountTransaction = new StellarSdk.TransactionBuilder(updatedSourceAccount, {
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: "100000"
  })
    .addOperation(StellarSdk.Operation.createAccount({
      destination: newAccountPublicKey,
      startingBalance: "2" // Must be at least 1 XLM
    }))
    .setTimeout(300)
    .build();

  // Sign the transaction
  createAccountTransaction.sign(sourceKeypair);

  // Submit to the network
  try {
    const createResult = await server.submitTransaction(createAccountTransaction);
    console.log("Create account transaction successful! Hash:", createResult.hash);
    console.log("New account public key:", newAccountPublicKey);
    console.log("New account secret key:", newAccountKeypair.secret());
  } catch (error) {
    console.error("Create account transaction failed:", error);
  }

  // Multi-signature account setup
  // Formula: signer_1 * weight_1 + signer_2 * weight_2 + ... >= threshold
  console.log("\n=== Multi-signature Account Setup ===");
  
  // Generate additional signers
  const signer1 = StellarSdk.Keypair.random();
  const signer2 = StellarSdk.Keypair.random();
  const signer3 = StellarSdk.Keypair.random();
  
  console.log("Signer 1:", signer1.publicKey());
  console.log("Signer 2:", signer2.publicKey());
  console.log("Signer 3:", signer3.publicKey());
  
  // Set weights and threshold
  // Example: threshold = 3, signer1 weight = 2, signer2 weight = 1, signer3 weight = 1
  // This means: signer1 alone (2) < threshold (3), but signer1 + signer2 (2+1=3) >= threshold
  const signer1Weight = 2;
  const signer2Weight = 1;
  const signer3Weight = 1;
  const threshold = 3;
  
  console.log("\nWeights: Signer1=" + signer1Weight + ", Signer2=" + signer2Weight + ", Signer3=" + signer3Weight);
  console.log("Threshold:", threshold);
  console.log("Validation: signer_1 * weight_1 + signer_2 * weight_2 + ... >= threshold");
  
  // Reload account for multisig setup
  const multisigAccount = await server.loadAccount(sourcePublicKey);
  
  const setOptionsTransaction = new StellarSdk.TransactionBuilder(multisigAccount, {
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: "100000"
  })
    .addOperation(StellarSdk.Operation.setOptions({
      signer: {
        ed25519PublicKey: signer1.publicKey(),
        weight: signer1Weight
      }
    }))
    .addOperation(StellarSdk.Operation.setOptions({
      signer: {
        ed25519PublicKey: signer2.publicKey(),
        weight: signer2Weight
      }
    }))
    .addOperation(StellarSdk.Operation.setOptions({
      signer: {
        ed25519PublicKey: signer3.publicKey(),
        weight: signer3Weight
      }
    }))
    .addOperation(StellarSdk.Operation.setOptions({
      masterWeight: 0, // Disable master key
      lowThreshold: threshold,
      medThreshold: threshold,
      highThreshold: threshold
    }))
    .setTimeout(300)
    .build();
  
  // Sign with master key (last time it can be used)
  setOptionsTransaction.sign(sourceKeypair);
  
  try {
    const setOptionsResult = await server.submitTransaction(setOptionsTransaction);
    console.log("\nMulti-signature setup successful! Hash:", setOptionsResult.hash);
    console.log("Account now requires", threshold, "weight to authorize transactions");
    
    // Example: Create a transaction that requires multisig
    const destinationKeypair2 = StellarSdk.Keypair.random();
    const finalAccount = await server.loadAccount(sourcePublicKey);
    
    const multisigTransaction = new StellarSdk.TransactionBuilder(finalAccount, {
      networkPassphrase: StellarSdk.Networks.TESTNET,
      fee: "100000"
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationKeypair2.publicKey(),
        asset: StellarSdk.Asset.native(),
        amount: "1"
      }))
      .setTimeout(300)
      .build();
    
    // Sign with signer1 (weight 2) and signer2 (weight 1) = total 3 >= threshold 3
    console.log("\nSigning transaction with Signer1 (weight 2) and Signer2 (weight 1)...");
    multisigTransaction.sign(signer1); // weight = 2
    multisigTransaction.sign(signer2); // weight = 1
    // Total weight = 3 >= threshold = 3 ✓
    
    const multisigResult = await server.submitTransaction(multisigTransaction);
    console.log("Multi-signature transaction successful! Hash:", multisigResult.hash);
    console.log("Total weight used:", signer1Weight + signer2Weight, ">=", threshold);
    
  } catch (error) {
    console.error("Multi-signature setup/transaction failed:", error);
  }

  // Managing multi-signature transactions with varying threshold requirements
  // Stellar's multi-sig system is based on three key components: signers, their weights, and operation thresholds
  // A transaction is valid when: signer_1 * weight_1 + signer_2 * weight_2 + ... >= threshold
  console.log("\n=== Multi-Signature with Varying Thresholds ===");
  console.log("Setting up account with different thresholds for different operation types:");
  console.log("  - Low threshold: For operations like AllowTrust");
  console.log("  - Medium threshold: For operations like Payment, ChangeTrust");
  console.log("  - High threshold: For operations like SetOptions, AccountMerge");
  
  // Practical example: 3-signer setup where:
  // - Daily operations require any single trusted party (low threshold = 50)
  // - Payments require 2 out of 3 signers (medium threshold = 100)
  // - Account configuration changes require all 3 signers (high threshold = 150)
  
  const flexibleSigner1 = StellarSdk.Keypair.random();
  const flexibleSigner2 = StellarSdk.Keypair.random();
  const flexibleSigner3 = StellarSdk.Keypair.random();
  
  const signerWeight = 50; // Each signer has weight 50
  const lowThreshold = 50;   // 1 signature needed (50 >= 50)
  const mediumThreshold = 100; // 2 signatures needed (100 >= 100)
  const highThreshold = 150;  // 3 signatures needed (150 >= 150)
  
  console.log("\nSigners:");
  console.log("  Signer 1:", flexibleSigner1.publicKey(), "(weight:", signerWeight + ")");
  console.log("  Signer 2:", flexibleSigner2.publicKey(), "(weight:", signerWeight + ")");
  console.log("  Signer 3:", flexibleSigner3.publicKey(), "(weight:", signerWeight + ")");
  console.log("\nThresholds:");
  console.log("  Low:", lowThreshold, "- requires 1 signature");
  console.log("  Medium:", mediumThreshold, "- requires 2 signatures");
  console.log("  High:", highThreshold, "- requires 3 signatures");
  
  try {
    // Reload account for flexible multisig setup
    const flexibleAccount = await server.loadAccount(sourcePublicKey);
    
    const flexibleSetOptionsTx = new StellarSdk.TransactionBuilder(flexibleAccount, {
      networkPassphrase: StellarSdk.Networks.TESTNET,
      fee: "100000"
    })
      .addOperation(StellarSdk.Operation.setOptions({
        signer: {
          ed25519PublicKey: flexibleSigner1.publicKey(),
          weight: signerWeight
        }
      }))
      .addOperation(StellarSdk.Operation.setOptions({
        signer: {
          ed25519PublicKey: flexibleSigner2.publicKey(),
          weight: signerWeight
        }
      }))
      .addOperation(StellarSdk.Operation.setOptions({
        signer: {
          ed25519PublicKey: flexibleSigner3.publicKey(),
          weight: signerWeight
        }
      }))
      .addOperation(StellarSdk.Operation.setOptions({
        masterWeight: 0, // Disable master key
        lowThreshold: lowThreshold,
        medThreshold: mediumThreshold,
        highThreshold: highThreshold
      }))
      .setTimeout(300)
      .build();
    
    // Sign with master key (last time it can be used)
    flexibleSetOptionsTx.sign(sourceKeypair);
    
    const flexibleResult = await server.submitTransaction(flexibleSetOptionsTx);
    console.log("\nFlexible multi-signature setup successful! Hash:", flexibleResult.hash);
    console.log("\nNow the account requires:");
    console.log("  - Low operations: 1 signature (weight 50)");
    console.log("  - Medium operations: 2 signatures (weight 100)");
    console.log("  - High operations: 3 signatures (weight 150)");
    
    // Example: Low threshold operation (1 signature)
    console.log("\n--- Example: Low Threshold Operation ---");
    const lowOpAccount = await server.loadAccount(sourcePublicKey);
    const lowOpTx = new StellarSdk.TransactionBuilder(lowOpAccount, {
      networkPassphrase: StellarSdk.Networks.TESTNET,
      fee: "100000"
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: StellarSdk.Keypair.random().publicKey(),
        asset: StellarSdk.Asset.native(),
        amount: "0.5"
      }))
      .setTimeout(300)
      .build();
    
    // For medium threshold (payment), we need 2 signatures
    lowOpTx.sign(flexibleSigner1); // weight 50
    lowOpTx.sign(flexibleSigner2); // weight 50
    // Total: 100 >= 100 (medium threshold) ✓
    
    console.log("Signed with Signer1 and Signer2 (total weight: 100)");
    console.log("This meets the medium threshold (100) for payment operations");
    
    // Note: Important considerations:
    // - Maximum signatures: Up to 20 signatures can be attached to one transaction
    // - Exact threshold matching: If you provide more signatures than needed, 
    //   the transaction will fail with TX_BAD_AUTH_EXTRA
    // - Account reserves: Each additional signer increases your account's minimum 
    //   balance by one base reserve (0.5 XLM)
    
  } catch (error) {
    console.error("Flexible multi-signature setup failed:", error.message);
  }

  // Set account options with master weight and new signer
  console.log("\n=== Setting Account Options with Master Weight ===");
  
  const newSigner = StellarSdk.Keypair.random();
  console.log("New signer public key:", newSigner.publicKey());
  console.log("New signer secret key:", newSigner.secret());
  
  const setOptOp = StellarSdk.Operation.setOptions({
    masterWeight: 255,
    signer: {
      ed25519PublicKey: newSigner.publicKey(),
      weight: 255,
    },
  });
  
  // Set threshold options
  const threshOp = StellarSdk.Operation.setOptions({
    lowThreshold: 100,
    medThreshold: 200,
    highThreshold: 255
  });
  
  // Reload account to get updated sequence
  const accountForOptions = await server.loadAccount(sourcePublicKey);
  
  const setOptionsTx = new StellarSdk.TransactionBuilder(accountForOptions, {
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: "100000"
  })
    .addOperation(setOptOp)
    .addOperation(threshOp)
    .setTimeout(300)
    .build();
  
  // Sign with current keypair
  setOptionsTx.sign(sourceKeypair);
  
  try {
    const setOptResult = await server.submitTransaction(setOptionsTx);
    console.log("Set options transaction successful! Hash:", setOptResult.hash);
    console.log("Master weight set to: 255 (maximum)");
    console.log("New signer added with weight: 255 (maximum)");
    console.log("Thresholds set - Low: 100, Medium: 200, High: 255");
  } catch (error) {
    console.error("Set options transaction failed:", error);
  }

  // Soroban smart contract authorization
  console.log("\n=== Soroban Smart Contract Authorization ===");
  
  // Import authorizeEntry for Soroban authorization
  const { authorizeEntry } = require("@stellar/stellar-sdk");
  
  // Create Soroban RPC server (for smart contracts)
  const sorobanServer = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org");
  
  // Create additional signers for authorization example
  const signers = [
    sourceKeypair,
    StellarSdk.Keypair.random(),
    StellarSdk.Keypair.random()
  ];
  
  console.log("Signers for authorization:");
  signers.forEach((signer, index) => {
    console.log(`Signer ${index + 1}:`, signer.publicKey());
  });
  
  // Note: For a real Soroban transaction, you would create a contract invocation
  // This is a simplified example showing the authorization pattern
  try {
    // Example: Create a simple Soroban transaction
    // In practice, this would be a contract invocation transaction
    const sorobanAccount = await sorobanServer.getAccount(sourcePublicKey);
    const validUntilLedger = (await sorobanServer.getLatestLedger()).sequenceNumber + 100;
    
    // Create a Soroban transaction (simplified - in practice this would invoke a contract)
    const sorobanTx = new StellarSdk.TransactionBuilder(sorobanAccount, {
      networkPassphrase: StellarSdk.Networks.TESTNET,
      fee: "100000"
    })
      .setTimeout(300)
      .build();
    
    // Simulate the transaction
    console.log("\nSimulating Soroban transaction...");
    const simResult = await sorobanServer.simulateTransaction(sorobanTx);
    
    if (simResult.restoreNeeded) {
      console.log("Transaction requires restoration");
    }
    
    // Sign authorization entries
    // authorizeEntry is used to sign authorization entries returned from simulation
    if (simResult.auth && simResult.auth.length > 0) {
      console.log("Found", simResult.auth.length, "authorization entry(ies)");
      
      // Sign the first authorization entry with signers[1]
      const authorizedTx = authorizeEntry(
        simResult,
        signers[1], // The keypair that needs to authorize
        validUntilLedger
      );
      
      console.log("Authorization entry signed by:", signers[1].publicKey());
      console.log("Valid until ledger:", validUntilLedger);
    } else {
      console.log("No authorization entries found in simulation result");
    }
    
  } catch (error) {
    console.error("Soroban authorization example failed:", error.message);
    console.log("Note: This is a demonstration. Real Soroban transactions require contract invocations.");
  }
}

main().catch(console.error);

