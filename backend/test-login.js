const fetch = require('node-fetch');

async function testLogin() {
    const testCases = [
        { email: "admin@superadmin.co.id", password: "password123", name: "Super Admin" },
        { email: "jokiinformatika@gmail.com", password: "joki123", name: "Joki Admin" },
        { email: "orbitbilliard.id@gmail.com", password: "orbit123", name: "Orbit Admin" },
        { email: "hi@catatmak.com", password: "catatmak123", name: "Catatmak Admin" }
    ];

    console.log("🧪 Testing Login Endpoints\n");
    console.log("=".repeat(80));

    for (const test of testCases) {
        try {
            const response = await fetch('http://127.0.0.1:5900/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: test.email, password: test.password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`✅ ${test.name}: LOGIN SUCCESS`);
                console.log(`   Email: ${data.user.email}`);
                console.log(`   Role: ${data.user.role}`);
                console.log(`   ProductID: ${data.user.productId || 'null'}`);
            } else {
                console.log(`❌ ${test.name}: LOGIN FAILED`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Message: ${data.message}`);
            }
        } catch (err) {
            console.log(`❌ ${test.name}: ERROR`);
            console.log(`   ${err.message}`);
        }
        console.log("-".repeat(80));
    }
}

testLogin();
