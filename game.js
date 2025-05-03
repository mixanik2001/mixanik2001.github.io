// Константы игры
const TILE_SIZE = 32;
const GRID_SIZE = 13;
const CANVAS_SIZE = TILE_SIZE * GRID_SIZE;

// Типы объектов
const OBJECT_TYPES = {
    EMPTY: 0,
    BRICK: 1,
    STEEL: 2,
    WATER: 3,
    BUSH: 4,
    BASE: 5
};

// Направления
const DIRECTIONS = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// Цвета
const COLORS = {
    PLAYER: '#ffffff',
    ENEMY: '#0000ff',
    BRICK: '#b86f50',
    STEEL: '#777777',
    WATER: '#5555ff',
    BUSH: '#60a060',
    BASE: '#aaaaaa',
    BULLET: '#ffffff',
    EXPLOSION: '#ff8000'
};

// Уровень 1 (карта)
const LEVEL_1 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 0],
    [2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2],
    [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 5, 1, 1, 0, 0, 0, 0]
];

// Инициализация
let canvas, ctx;
let gameRunning = false;
let gameOver = false;
let playerTank;
let enemies = [];
let bullets = [];
let explosions = [];
let level = [...LEVEL_1];
let score = 0;
let lives = 3;
let animationFrameId;
let keysPressed = {}; // Объект для хранения состояния нажатых клавиш
let mobileButtonsPressed = { up: false, down: false, left: false, right: false }; // Состояние мобильных кнопок

// Танк игрока
class Tank {
    constructor(x, y, direction, isPlayer) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isPlayer = isPlayer;
        this.color = isPlayer ? COLORS.PLAYER : COLORS.ENEMY;
        this.cooldown = 0;
        this.speed = isPlayer ? 3 : 2;
        this.size = TILE_SIZE - 2;
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }

    move(direction) {
        this.direction = direction;
        
        let newX = this.x;
        let newY = this.y;
        
        switch (direction) {
            case DIRECTIONS.UP:
                newY -= this.speed;
                break;
            case DIRECTIONS.RIGHT:
                newX += this.speed;
                break;
            case DIRECTIONS.DOWN:
                newY += this.speed;
                break;
            case DIRECTIONS.LEFT:
                newX -= this.speed;
                break;
        }
        
        // Проверка коллизий со стенами и границами
        if (newX < 0 || newX > CANVAS_SIZE - this.size || 
            newY < 0 || newY > CANVAS_SIZE - this.size) {
            return; // Не двигаемся, если выходим за границы
        }
        
        // Проверка коллизий с объектами карты
        if (!this.checkCollision(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }
    
    checkCollision(x, y) {
        // Получение координат сетки для углов танка
        const gridPositions = [
            {x: Math.floor(x / TILE_SIZE), y: Math.floor(y / TILE_SIZE)},
            {x: Math.floor((x + this.size) / TILE_SIZE), y: Math.floor(y / TILE_SIZE)},
            {x: Math.floor(x / TILE_SIZE), y: Math.floor((y + this.size) / TILE_SIZE)},
            {x: Math.floor((x + this.size) / TILE_SIZE), y: Math.floor((y + this.size) / TILE_SIZE)}
        ];
        
        // Проверка каждой позиции
        for (const pos of gridPositions) {
            if (pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE) {
                const tileType = level[pos.y][pos.x];
                if (tileType === OBJECT_TYPES.BRICK || 
                    tileType === OBJECT_TYPES.STEEL || 
                    tileType === OBJECT_TYPES.WATER ||
                    tileType === OBJECT_TYPES.BASE) {
                    return true; // Есть коллизия
                }
            }
        }
        
        // Проверка коллизий с другими танками
        if (this.isPlayer) {
            for (const enemy of enemies) {
                if (this.collidesWithTank(x, y, enemy)) {
                    return true;
                }
            }
        } else {
            if (this.collidesWithTank(x, y, playerTank)) {
                return true;
            }
            
            for (const enemy of enemies) {
                if (enemy !== this && this.collidesWithTank(x, y, enemy)) {
                    return true;
                }
            }
        }
        
        return false; // Нет коллизий
    }
    
    collidesWithTank(x, y, otherTank) {
        return x < otherTank.x + otherTank.size &&
               x + this.size > otherTank.x &&
               y < otherTank.y + otherTank.size &&
               y + this.size > otherTank.y;
    }

    shoot() {
        if (this.cooldown > 0) return;
        
        let bulletX = this.x + this.size / 2 - 2;
        let bulletY = this.y + this.size / 2 - 2;
        
        switch (this.direction) {
            case DIRECTIONS.UP:
                bulletY = this.y - 5;
                break;
            case DIRECTIONS.RIGHT:
                bulletX = this.x + this.size + 1;
                break;
            case DIRECTIONS.DOWN:
                bulletY = this.y + this.size + 1;
                break;
            case DIRECTIONS.LEFT:
                bulletX = this.x - 5;
                break;
        }
        
        bullets.push(new Bullet(bulletX, bulletY, this.direction, this.isPlayer));
        this.cooldown = 30; // Перезарядка
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Добавляем контур
        ctx.strokeStyle = '#006400'; // Темно-зеленый цвет контура
        ctx.lineWidth = 1; // Толщина линии
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        // Рисуем пушку танка
        ctx.fillStyle = this.color;
        const center = {
            x: this.x + this.size / 2,
            y: this.y + this.size / 2
        };
        
        let barrelLength = this.size / 2 + 5;
        let barrelWidth = 4;
        
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(this.direction * Math.PI / 2);
        ctx.fillRect(-barrelWidth / 2, -barrelLength, barrelWidth, barrelLength);
        ctx.restore();
    }
}

// Пуля
class Bullet {
    constructor(x, y, direction, isPlayerBullet) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isPlayerBullet = isPlayerBullet;
        this.speed = 5;
        this.size = 4;
    }

    update() {
        switch (this.direction) {
            case DIRECTIONS.UP:
                this.y -= this.speed;
                break;
            case DIRECTIONS.RIGHT:
                this.x += this.speed;
                break;
            case DIRECTIONS.DOWN:
                this.y += this.speed;
                break;
            case DIRECTIONS.LEFT:
                this.x -= this.speed;
                break;
        }
        
        return this.checkCollision();
    }

    checkCollision() {
        // Проверка выхода за границы
        if (this.x < 0 || this.x > CANVAS_SIZE || this.y < 0 || this.y > CANVAS_SIZE) {
            return true; // Удалить пулю
        }
        
        // Получение координат сетки для пули
        const gridX = Math.floor(this.x / TILE_SIZE);
        const gridY = Math.floor(this.y / TILE_SIZE);
        
        if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
            const tileType = level[gridY][gridX];
            
            if (tileType === OBJECT_TYPES.BRICK) {
                level[gridY][gridX] = OBJECT_TYPES.EMPTY;
                explosions.push(new Explosion(gridX * TILE_SIZE, gridY * TILE_SIZE));
                return true;
            } else if (tileType === OBJECT_TYPES.STEEL) {
                explosions.push(new Explosion(this.x - 8, this.y - 8, 0.5));
                return true;
            } else if (tileType === OBJECT_TYPES.BASE) {
                level[gridY][gridX] = OBJECT_TYPES.EMPTY;
                explosions.push(new Explosion(gridX * TILE_SIZE, gridY * TILE_SIZE, 2));
                gameOver = true;
                return true;
            }
        }
        
        // Проверка коллизий с танками
        if (this.isPlayerBullet) {
            for (let i = 0; i < enemies.length; i++) {
                if (this.collidesWithTank(enemies[i])) {
                    explosions.push(new Explosion(enemies[i].x, enemies[i].y));
                    enemies.splice(i, 1);
                    score += 100;
                    document.getElementById('score').textContent = score;
                    return true;
                }
            }
        } else {
            if (this.collidesWithTank(playerTank)) {
                explosions.push(new Explosion(playerTank.x, playerTank.y));
                lives--;
                document.getElementById('lives').textContent = lives;
                
                if (lives <= 0) {
                    gameOver = true;
                } else {
                    respawnPlayer();
                }
                
                return true;
            }
        }
        
        // Проверка коллизий с другими пулями
        for (let i = 0; i < bullets.length; i++) {
            const otherBullet = bullets[i];
            if (otherBullet !== this && this.collidesWithBullet(otherBullet)) {
                bullets.splice(i, 1);
                explosions.push(new Explosion(this.x - 8, this.y - 8, 0.5));
                return true;
            }
        }
        
        return false; // Нет коллизий, не удалять пулю
    }
    
    collidesWithTank(tank) {
        return this.x > tank.x && 
               this.x < tank.x + tank.size && 
               this.y > tank.y && 
               this.y < tank.y + tank.size;
    }
    
    collidesWithBullet(bullet) {
        const distance = Math.sqrt(
            Math.pow(this.x - bullet.x, 2) + 
            Math.pow(this.y - bullet.y, 2)
        );
        return distance < this.size + bullet.size;
    }

    draw() {
        ctx.fillStyle = COLORS.BULLET;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Взрыв
class Explosion {
    constructor(x, y, scale = 1) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.radius = 16 * scale;
        this.life = 20;
    }

    update() {
        this.life--;
        return this.life <= 0;
    }

    draw() {
        const alpha = this.life / 20;
        ctx.fillStyle = `rgba(255, 128, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, this.radius * (1 - alpha / 2), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, this.radius * (1 - alpha), 0, Math.PI * 2);
        ctx.fill();
    }
}

// Инициализация игры
function initGame() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx = canvas.getContext('2d');
    
    document.getElementById('lives').textContent = lives;
    document.getElementById('score').textContent = score;
    
    // Обработчики нажатий и отпускания клавиш
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Обработчик клика мыши для выстрела
    canvas.addEventListener('mousedown', (event) => {
        if (gameRunning && !gameOver && event.button === 0) { // 0 - левая кнопка
            playerTank.shoot();
        }
    });
    
    // --- Мобильные кнопки ---
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const fireBtn = document.getElementById('fireBtn');

    // Функция для установки состояния кнопки направления
    const setMobileDirection = (direction, state) => {
        if (gameRunning && !gameOver) {
            mobileButtonsPressed[direction] = state;
        } else {
             // Сбрасываем все состояния, если игра не активна
             Object.keys(mobileButtonsPressed).forEach(key => mobileButtonsPressed[key] = false);
        }
    };
    
    // События НАЖАТИЯ для кнопок направления
    upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setMobileDirection('up', true); }, { passive: false });
    upBtn.addEventListener('mousedown', () => setMobileDirection('up', true));
    downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setMobileDirection('down', true); }, { passive: false });
    downBtn.addEventListener('mousedown', () => setMobileDirection('down', true));
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setMobileDirection('left', true); }, { passive: false });
    leftBtn.addEventListener('mousedown', () => setMobileDirection('left', true));
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setMobileDirection('right', true); }, { passive: false });
    rightBtn.addEventListener('mousedown', () => setMobileDirection('right', true));

    // События ОТПУСКАНИЯ для кнопок направления
    const releaseEvents = ['touchend', 'mouseup', 'mouseleave', 'touchcancel'];
    releaseEvents.forEach(event => {
        upBtn.addEventListener(event, () => setMobileDirection('up', false));
        downBtn.addEventListener(event, () => setMobileDirection('down', false));
        leftBtn.addEventListener(event, () => setMobileDirection('left', false));
        rightBtn.addEventListener(event, () => setMobileDirection('right', false));
    });

    // Кнопка Огня (оставляем как было - одиночный выстрел)
    fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (gameRunning && !gameOver && playerTank) playerTank.shoot(); }, { passive: false });
    fireBtn.addEventListener('mousedown', () => { if (gameRunning && !gameOver && playerTank) playerTank.shoot(); });

    
    // Кнопки меню
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
}

function startGame() {
    gameRunning = true;
    gameOver = false;
    
    // Инициализация уровня
    level = JSON.parse(JSON.stringify(LEVEL_1));
    
    // Создание танка игрока
    playerTank = new Tank(6 * TILE_SIZE, 11 * TILE_SIZE, DIRECTIONS.UP, true);
    
    // Создание танков противника
    enemies = [];
    createEnemies();
    
    // Сброс счета и жизней
    score = 0;
    lives = 3;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    
    // Обновление UI
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'none';
    document.getElementById('welcome-message').style.display = 'none';
    
    // Запуск игрового цикла
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    gameLoop();
}

function resetGame() {
    // Остановить текущую игру
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Сбросить игровое состояние
    bullets = [];
    explosions = [];
    
    // Перезапустить игру
    startGame();
}

function createEnemies() {
    // Создаем 3 танка противника в разных местах
    enemies.push(new Tank(0, 0, DIRECTIONS.DOWN, false));
    enemies.push(new Tank(6 * TILE_SIZE, 0, DIRECTIONS.DOWN, false));
    enemies.push(new Tank(12 * TILE_SIZE, 0, DIRECTIONS.DOWN, false));
}

function respawnEnemy() {
    if (enemies.length < 5 && Math.random() < 0.02) {
        const spawnPoints = [
            {x: 0, y: 0},
            {x: 6 * TILE_SIZE, y: 0},
            {x: 12 * TILE_SIZE, y: 0}
        ];
        
        const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        enemies.push(new Tank(spawnPoint.x, spawnPoint.y, DIRECTIONS.DOWN, false));
    }
}

function respawnPlayer() {
    playerTank.x = 6 * TILE_SIZE;
    playerTank.y = 11 * TILE_SIZE;
    playerTank.direction = DIRECTIONS.UP;
}

function handleKeyDown(e) {
    if (!gameRunning || gameOver) return;
    keysPressed[e.code] = true; // Помечаем клавишу как нажатую
}

function handleKeyUp(e) {
    keysPressed[e.code] = false; // Помечаем клавишу как отпущенную
}

function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.update();
        
        // Случайное движение и стрельба
        if (Math.random() < 0.05) {
            enemy.direction = Math.floor(Math.random() * 4);
        }
        
        if (Math.random() < 0.01) {
            enemy.shoot();
        }
        
        enemy.move(enemy.direction);
    }
    
    respawnEnemy();
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (bullet.update()) {
            bullets.splice(i, 1);
        }
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        if (explosion.update()) {
            explosions.splice(i, 1);
        }
    }
}

function drawMap() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tileType = level[y][x];
            const tileX = x * TILE_SIZE;
            const tileY = y * TILE_SIZE;
            
            switch (tileType) {
                case OBJECT_TYPES.BRICK:
                    ctx.fillStyle = COLORS.BRICK;
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    
                    // Рисуем текстуру кирпичей
                    ctx.strokeStyle = '#9a5c42';
                    ctx.lineWidth = 1;
                    for (let by = 0; by < 4; by++) {
                        for (let bx = 0; bx < 4; bx++) {
                            if ((bx + by) % 2 === 0) {
                                ctx.strokeRect(
                                    tileX + bx * (TILE_SIZE / 4), 
                                    tileY + by * (TILE_SIZE / 4), 
                                    TILE_SIZE / 4, 
                                    TILE_SIZE / 4
                                );
                            }
                        }
                    }
                    break;
                case OBJECT_TYPES.STEEL:
                    ctx.fillStyle = COLORS.STEEL;
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    
                    // Рисуем текстуру стали
                    ctx.fillStyle = '#999999';
                    ctx.fillRect(tileX + 3, tileY + 3, TILE_SIZE - 6, TILE_SIZE - 6);
                    ctx.fillStyle = '#666666';
                    ctx.fillRect(tileX + 6, tileY + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                    break;
                case OBJECT_TYPES.WATER:
                    ctx.fillStyle = COLORS.WATER;
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    
                    // Рисуем текстуру воды
                    ctx.fillStyle = '#4444cc';
                    for (let i = 0; i < 3; i++) {
                        ctx.fillRect(
                            tileX + i * 12, 
                            tileY + Math.sin(Date.now() / 200 + i) * 5 + 10, 
                            10, 
                            2
                        );
                    }
                    break;
                case OBJECT_TYPES.BUSH:
                    ctx.fillStyle = COLORS.BUSH;
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    
                    // Рисуем текстуру кустов
                    ctx.fillStyle = '#4d8c4d';
                    for (let i = 0; i < 5; i++) {
                        ctx.beginPath();
                        ctx.arc(
                            tileX + Math.random() * TILE_SIZE, 
                            tileY + Math.random() * TILE_SIZE, 
                            5, 
                            0, 
                            Math.PI * 2 
                        );
                        ctx.fill();
                    }
                    break;
                case OBJECT_TYPES.BASE:
                    ctx.fillStyle = COLORS.BASE;
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    
                    // Рисуем флаг базы
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(tileX + 8, tileY + 8, TILE_SIZE - 16, TILE_SIZE - 16);
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(tileX + 12, tileY + 12, TILE_SIZE - 24, TILE_SIZE - 24);
                    break;
            }
        }
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    // Обработка ввода пользователя (непрерывное движение)
    if (!gameOver && playerTank) { // Добавим проверку на существование playerTank
        if (keysPressed['KeyW'] || keysPressed['ArrowUp'] || mobileButtonsPressed.up) {
            playerTank.move(DIRECTIONS.UP);
        } else if (keysPressed['KeyS'] || keysPressed['ArrowDown'] || mobileButtonsPressed.down) {
            playerTank.move(DIRECTIONS.DOWN);
        } else if (keysPressed['KeyA'] || keysPressed['ArrowLeft'] || mobileButtonsPressed.left) {
            playerTank.move(DIRECTIONS.LEFT);
        } else if (keysPressed['KeyD'] || keysPressed['ArrowRight'] || mobileButtonsPressed.right) {
            playerTank.move(DIRECTIONS.RIGHT);
        }
    }
    
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Обновление игровых объектов
    playerTank.update();
    updateEnemies();
    updateBullets();
    updateExplosions();
    
    // Проверка окончания игры
    if (gameOver) {
        endGame();
        return;
    }
    
    // Проверка победы (все враги уничтожены)
    if (enemies.length === 0 && score > 500) {
        showVictory();
        return;
    }
    
    // Рисование игровых объектов
    drawMap();
    
    // Рисуем кусты поверх танков
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (level[y][x] === OBJECT_TYPES.BUSH) {
                const tileX = x * TILE_SIZE;
                const tileY = y * TILE_SIZE;
                
                ctx.fillStyle = COLORS.BUSH;
                ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                
                ctx.fillStyle = '#4d8c4d';
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(
                        tileX + Math.random() * TILE_SIZE, 
                        tileY + Math.random() * TILE_SIZE, 
                        5, 
                        0, 
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }
    }
    
    playerTank.draw();
    
    for (const enemy of enemies) {
        enemy.draw();
    }
    
    for (const bullet of bullets) {
        bullet.draw();
    }
    
    for (const explosion of explosions) {
        explosion.draw();
    }
    
    // Продолжаем игровой цикл
    animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Счет: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    
    document.getElementById('restartBtn').style.display = 'block';
}

function showVictory() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ПОБЕДА!', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Счет: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    
    document.getElementById('restartBtn').style.display = 'block';
}

// Запуск инициализации после загрузки страницы
window.addEventListener('load', initGame); 