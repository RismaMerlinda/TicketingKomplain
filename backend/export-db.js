const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const EXPORT_PATH = path.join(__dirname, 'data-backup.json');

async function exportDatabase() {
    try {
        console.log('🔄 Menghubungkan ke MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung.');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const backupData = {};

        for (const col of collections) {
            const name = col.name;
            // Lewati system collections
            if (name.startsWith('system.')) continue;

            console.log(`📦 Exporting collection: ${name}...`);
            const data = await db.collection(name).find({}).toArray();
            backupData[name] = data;
        }

        fs.writeFileSync(EXPORT_PATH, JSON.stringify(backupData, null, 2));
        console.log(`\n✨ Berhasil! Data disimpan ke: ${EXPORT_PATH}`);
        console.log('📝 Silakan push file data-backup.json ke GitHub agar bisa di-pull teman Anda.');

    } catch (error) {
        console.error('❌ Erro saat export:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

exportDatabase();
