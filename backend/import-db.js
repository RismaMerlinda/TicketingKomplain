const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const IMPORT_PATH = path.join(__dirname, 'data-backup.json');

async function importDatabase() {
    try {
        if (!fs.existsSync(IMPORT_PATH)) {
            console.error('❌ File data-backup.json tidak ditemukan! Pastikan Anda sudah melakukan git pull.');
            return;
        }

        console.log('🔄 Menghubungkan ke MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung.');

        const backupData = JSON.parse(fs.readFileSync(IMPORT_PATH, 'utf8'));
        const db = mongoose.connection.db;

        for (const [collectionName, documents] of Object.entries(backupData)) {
            console.log(`📥 Importing collection: ${collectionName} (${documents.length} data)...`);

            // Hapus data lama agar tidak duplikat
            await db.collection(collectionName).deleteMany({});

            if (documents.length > 0) {
                // Masukkan data baru
                await db.collection(collectionName).insertMany(documents);
            }
        }

        console.log('\n✨ Berhasil! Database Anda sekarang sama dengan data terakhir di GitHub.');

    } catch (error) {
        console.error('❌ Error saat import:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

importDatabase();
