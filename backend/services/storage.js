const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/debts.json');

async function getDebts() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.writeFile(DATA_FILE, '[]');
            return [];
        }
        throw err;
    }
}

async function saveDebt(debt) {
    const debts = await getDebts();
    debts.push(debt);
    await fs.writeFile(DATA_FILE, JSON.stringify(debts, null, 2));
    return debt;
}

async function updateDebt(id, updates) {
    const debts = await getDebts();
    const index = debts.findIndex(d => d.id === id);
    if (index !== -1) {
        debts[index] = { ...debts[index], ...updates };
        await fs.writeFile(DATA_FILE, JSON.stringify(debts, null, 2));
        return debts[index];
    }
    return null;
}

async function findUnpaidDebts() {
    const debts = await getDebts();
    return debts.filter(d => d.status === 'pending');
}

module.exports = {
    getDebts,
    saveDebt,
    updateDebt,
    findUnpaidDebts
};
