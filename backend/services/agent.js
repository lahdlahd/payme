const crypto = require('crypto');
const { saveDebt, updateDebt, findUnpaidDebts, getDebts } = require('./storage');
const { getBalance, getAgentWalletAddress } = require('./blockchain');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);


/**
 * 1. addDebt(name, amount)
 * saves debt into local storage, assigns unique ID, sets status = "pending"
 */
async function addDebt(name, amount, creditorAddress, txHash) {
    const debt = {
        id: crypto.randomUUID(),
        name,
        amount: parseFloat(amount),
        walletAddress: creditorAddress, // Payment should go directly to the creditor now!
        creditorAddress: creditorAddress.toLowerCase(),
        txHash: txHash || null,
        status: "pending",
        createdAt: Date.now()
    };
    await saveDebt(debt);
    console.log(`[AGENT] Added new debt for ${name} amount ${amount} mapped to ${creditorAddress}. TxHash: ${txHash}`);
    return debt;
}

/**
 * 2. generatePaymentRequest(debtId)
 * returns X Layer wallet address and formats message
 */
async function generatePaymentRequest(debtId) {
    // Note: For a real app, you might derive a unique address per debt.
    // Here we use the main agent wallet.
    const address = getAgentWalletAddress();
    const debts = await findUnpaidDebts();
    const debt = debts.find(d => d.id === debtId);
    
    if (!debt) throw new Error("Debt not found or already paid");

    const message = `Send ${debt.amount} to this wallet on X Layer: ${address}`;
    console.log(`[AGENT] Payment Request Generated for ${debt.name}: ${message}`);
    return { address, message, debt };
}

/**
 * 3. checkPayments()
 * queries X Layer blockchain via ethers.js
 * checks wallet balance or incoming transactions
 * if payment >= debt amount: mark debt as "paid"
 */
async function checkPayments() {
    console.log(`[AGENT] Checking payments securely on X Layer...`);
    const unpaid = await findUnpaidDebts();
    if (unpaid.length === 0) {
        console.log(`[AGENT] No unpaid debts to check.`);
        return;
    }

    try {
        const balanceStr = await getBalance();
        const balance = parseFloat(balanceStr);
        console.log(`[AGENT] Current Agent Wallet Balance: ${balance} OKB`);

        for (const debt of unpaid) {
            // MVP Logic: If the agent has enough balance to cover this debt, we mark it.
            // In a real strict environment, we'd check specific incoming txs for exact amounts.
            // Let's assume for hackathon purpose, if balance >= debt.amount, it's paid.
            // Note: This logic means the first checked debt gets marked if balance is generally high. 
            // We use this as a simple demonstration.
            if (balance >= debt.amount) {
                console.log(`[AGENT] Detected sufficient balance for debt ${debt.id}. Marking as PAID.`);
                await updateDebt(debt.id, { status: "paid" });
            }
        }
    } catch (err) {
        console.error(`[AGENT] Error checking payments:`, err);
    }
}

/**
 * 4. reminderEngine()
 * runs automatically
 * if debt > 3 days unpaid -> send gentle reminder
 * if > 7 days -> urgent reminder
 */
async function reminderEngine() {
    console.log(`[AGENT] Running reminder engine...`);
    const unpaid = await findUnpaidDebts();
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    for (const debt of unpaid) {
        const daysUnpaid = (now - debt.createdAt) / DAY_MS;
        
        if (daysUnpaid > 7) {
            console.log(`[AGENT] URGENT REMINDER: ${debt.name}, you are ${Math.floor(daysUnpaid)} days late on paying ${debt.amount}! Pay immediately.`);
        } else if (daysUnpaid > 3) {
            console.log(`[AGENT] GENTLE REMINDER: Hey ${debt.name}, just a quick reminder about the ${debt.amount} owed. Thanks!`);
        }
    }
}

async function sendEmailReminder(debtId, debtorEmail) {
    const debts = await getDebts();
    const debt = debts.find(d => d.id === debtId);
    if (!debt) throw new Error("Debt not found");

    if (!process.env.RESEND_API_KEY) {
        console.warn("\x1b[33m[AGENT] RESEND_API_KEY not configured! Simulating autonomous email drop to:\x1b[0m", debtorEmail);
        return { simulated: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Pay Me Back Agent <onboarding@resend.dev>',
            to: debtorEmail,
            subject: `URGENT: Outstanding Balance of $${debt.amount} for ${debt.name}`,
            html: `
            <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 10px;">
                <h1 style="color: #22c55e;">Pay Me Back Agent</h1>
                <p style="font-size: 16px;">Hello. This is an automated debt collection notice dispatched from X Layer.</p>
                <div style="background: #18181b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="font-weight: normal">Outstanding Balance: <span style="font-weight: bold; color: #ef4444;">$${debt.amount}</span></h2>
                    <p style="color: #a1a1aa"><strong>Creditor Wallet:</strong> ${debt.creditorAddress}</p>
                </div>
                <p>Please connect your wallet to the OKX X Layer network and settle this balance directly to the creditor's wallet immediately to avoid further autonomous reminders.</p>
                <br/>
                <a href="https://www.okx.com/explorer/xlayer/tx/${debt.txHash || ''}" style="color: #22c55e;">View Blockchain Proof</a>
            </div>
            `
        });

        if (error) {
            console.error("[AGENT] Resend rejected the transmission:", error);
            throw new Error(error.message);
        }

        console.log(`[AGENT] Email securely dispatched to ${debtorEmail}`);
        return data;

    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    addDebt,
    generatePaymentRequest,
    checkPayments,
    reminderEngine,
    sendEmailReminder
};
