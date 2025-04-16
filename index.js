import express from "express";
import mysql from "mysql2";
import cors from 'cors';
import multer from 'multer';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin_artem.com",
    database: "donate",
    port: 3306
})


// получения Админа
app.get('/api/admin', (req, res) => {
    db.query('SELECT * FROM `admin`', (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json(results); // Возвращаем пользователей клиенту
    });
});
// получения Пользователя
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM `users`', (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json(results); // Возвращаем пользователей клие
    });
});

app.get('/api/users/:name', (req, res) => {
    const { name } = req.params;

    const query = 'SELECT * FROM users WHERE name = ?';
    db.query(query, [name], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(results[0]); // Возвращаем одного пользователя
    });
});


// Настройка multer для загрузки файлов в память
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST-запрос на создание пользователя с изображением
app.post("/api/users/create", upload.single("image"), (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? .buffer;

    if (!name || !image) {
        return res.status(400).json({ error: "Name, description и image обязательны." });
    }

    const query = "INSERT INTO users (name, description, image) VALUES (?, ?, ?)";
    db.query(query, [name, description, image], (err, result) => {
        if (err) {
            console.error("Ошибка при вставке в базу данных:", err);
            return res.status(500).json({ error: "Ошибка сервера при добавлении пользователя" });
        }
        res.json({ message: "Пользователь успешно добавлен", id: result.insertId });
    });
});
// удалить пользователя 
app.delete("/api/users/delete/:id", (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({ error: "ID пользователя не передан" });
    }

    const query = "DELETE FROM users WHERE id = ?";

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Ошибка при удалении пользователя:", err);
            return res.status(500).json({ error: "Ошибка сервера при удалении пользователя" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json({ success: true, message: "Пользователь успешно удален" });
    });
});


//получения список клиптовалют пользователя
app.get('/api/wallets', (req, res) => {
    const username = req.query.name;

    if (!username) {
        return res.status(400).json({ error: 'Не указано имя пользователя' });
    }

    db.query('SELECT * FROM `wallets` WHERE `name` = ?', [username], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json(results);
    });
});
app.get('/api/wallets/:name', (req, res) => {
    const { name } = req.params;

    const query = 'SELECT * FROM wallets WHERE name = ?';
    db.query(query, [name], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(results); // Возвращаем одного пользователя
    });
});


// создания кошелька пользователя 
app.post('/api/wallets/create', (req, res) => {
    const { name, wallet_adress, crypto_name, ids } = req.body;

    if (!name || !wallet_adress || !crypto_name || !ids) {
        return res.status(400).json({ error: 'Не все поля заполнены' });
    }

    const query = 'INSERT INTO `wallets` (name, wallet_adress, crypto_name, ids) VALUES (?, ?, ?, ?)';
    const values = [name, wallet_adress, crypto_name, ids];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Ошибка при создании кошелька:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json({ success: true, message: 'Кошелек успешно добавлен' });
    });
});

// удалем кошелек у пользователя
app.delete('/api/wallets/delete/:id', (req, res) => {
    const walletId = req.params.id;

    if (!walletId) {
        return res.status(400).json({ error: 'ID кошелька не передан' });
    }

    const query = 'DELETE FROM `wallets` WHERE id = ?';

    db.query(query, [walletId], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении кошелька:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Кошелек не найден' });
        }

        res.json({ success: true, message: 'Кошелек успешно удален' });
    });
});

// получаем всех список донатеров 
app.get('/api/donaters', (req, res) => {

    db.query('SELECT * FROM `donaters`', (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json(results);
    });
});

// создаем нового донатера 
// POST: Создание нового донатера
app.post('/api/donaters/create', (req, res) => {
    const { username, price, message, type } = req.body;

    if (!username || !price || !type) {
        return res.status(400).json({ error: 'Обязательные поля: username, price, type' });
    }

    const date = new Date().toLocaleString('ru-RU', {
        timeZone: 'Europe/Moscow', // можно заменить на другую зону
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const query = 'INSERT INTO donaters (username, price, message, date, type) VALUES (?, ?, ?, ?, ?)';
    const values = [username, price, message || '', date, type];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Ошибка при добавлении донатера:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json({ success: true, message: 'Донатер успешно добавлен', date });
    });
});

//получаем и отправляем курсы криптовалют в фронтенд 
// Временный кэш в памяти
const cache = {};

app.post('/api/get-crypto-price', async(req, res) => {
    const { amount, crypto } = req.body;

    if (!amount || !crypto) {
        return res.status(400).json({ error: 'Missing amount or crypto' });
    }

    const cacheKey = `price_${crypto}`;
    const cached = cache[cacheKey];
    const now = Date.now();

    // Если кэш свежий (менее 60 секунд), возвращаем его
    if (cached && now - cached.timestamp < 60 * 1000) {
        const cryptoAmount = amount / cached.price;
        console.log(`(КЭШ) 1 ${crypto.toUpperCase()} = $${cached.price}`);
        return res.json({ amount: cached.price, cryptoAmount });
    }

    // Иначе — запрос к CoinGecko
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: crypto,
                vs_currencies: 'usd',
            },
        });

        const cryptoPriceInUsd = response.data[crypto]?.usd;

        if (cryptoPriceInUsd === undefined) {
            return res.status(404).json({ error: 'Price not found for ' + crypto });
        }

        // Сохраняем в кэш
        cache[cacheKey] = {
            price: cryptoPriceInUsd,
            timestamp: now
        };

        const cryptoAmount = amount / cryptoPriceInUsd;
        console.log(`1 ${crypto.toUpperCase()} = $${cryptoPriceInUsd}`);

        return res.json({ amount: cryptoPriceInUsd, cryptoAmount });

    } catch (error) {
        console.error('Error fetching data:', error.message);
        return res.status(500).json({ error: 'Failed to fetch price' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});