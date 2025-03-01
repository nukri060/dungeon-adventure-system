class DungeonSimulator {
    static LEVEL_XP = [
        { threshold: 1000, rank: 'E', basicXP: 1, strongXP: 5, bossXP: 30, bossChance: 0.8 },
        { threshold: 2000, rank: 'D', basicXP: 5, strongXP: 10, bossXP: 60, bossChance: 0.6 },
        { threshold: 3000, rank: 'C', basicXP: 10, strongXP: 15, bossXP: 90, bossChance: 0.6 },
        { threshold: 4000, rank: 'B', basicXP: 15, strongXP: 20, bossXP: 120, bossChance: 0.5 },
        { threshold: 5000, rank: 'A', basicXP: 20, strongXP: 25, bossXP: 150, bossChance: 0.4 },
        { threshold: 8000, rank: 'S', basicXP: 50, strongXP: 100, bossXP: 1000, bossChance: 0.3 }
    ];

    constructor() {
        this.isRunning = false;
        this.currentLevel = 0;
        this.totalXP = 0;
        this.totalNPCs = 0;
        this.dungeonCount = 0;
        this.totalDungeonXP = 0;
        this.targetLevel = 50;
        this.characterClass = CharacterClass.CLASSES.warrior;
        this.progressChart = new ProgressChart();
        this.initEventListeners();
        this.loadProgress();
    }

    initEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.start());
        document.getElementById('toggleDetails').addEventListener('click', () => this.toggleDetails());
        document.getElementById('cancelButton').addEventListener('click', () => this.cancel());
        document.getElementById('classSelect').addEventListener('change', (e) => {
            this.characterClass = CharacterClass.CLASSES[e.target.value];
        });
    }

    async start() {
        if (this.isRunning) return;

        this.targetLevel = Math.min(1000, Math.max(1, parseInt(document.getElementById('targetLevel').value) || 50));

        this.resetState();
        this.isRunning = true;
        this.updateUI();

        try {
            while (this.currentLevel < this.targetLevel && this.isRunning) {
                await this.runDungeon();
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        } catch (error) {
            console.error('Simulation error:', error);
        }

        this.isRunning = false;
        this.updateUI();
    }

    async runDungeon() {
        this.dungeonCount++;
        const rankInfo = this.getCurrentRankInfo();
        const result = this.calculateDungeon(rankInfo);

        this.totalXP += result.xpEarned;
        this.totalNPCs += result.npcKills.total;
        this.totalDungeonXP += result.xpEarned;

        this.processBossEncounter(rankInfo, result.bossSuccess);
        this.updateLevelProgress();
        this.logDungeonResult(rankInfo, result);
        this.updateUI();
        this.progressChart.update(this.currentLevel);
        StorageService.save(this.getState());
    }

    calculateDungeon(rankInfo) {
        const npcKills = { basic: 0, strong: 0, boss: 0, total: 0 };
        let xpEarned = 0;

        for (let i = 0; i < 10; i++) {
            const enemyType = this.getRandomEnemy();
            const count = this.generateEnemyCount(enemyType);
            const xp = this.calculateEnemyXP(enemyType, rankInfo, count);

            npcKills[this.getEnemyTypeName(enemyType)] += count;
            npcKills.total += count;
            xpEarned += xp;
        }

        const bossSuccess = Math.random() < rankInfo.bossChance;
        return { npcKills, xpEarned, bossSuccess };
    }

    processBossEncounter(rankInfo, bossSuccess) {
        if (!bossSuccess && rankInfo.rank === 'E') {
            this.totalXP = Math.max(0, this.totalXP - 30 * this.currentLevel);
        }
    }

    updateLevelProgress() {
        const rankInfo = this.getCurrentRankInfo();
        while (this.totalXP >= rankInfo.threshold && this.currentLevel < this.targetLevel) {
            this.totalXP -= rankInfo.threshold;
            this.currentLevel++;
        }
    }

    getCurrentRankInfo() {
        const rankIndex = Math.min(
            Math.floor(this.currentLevel / 5),
            DungeonSimulator.LEVEL_XP.length - 1
        );
        return DungeonSimulator.LEVEL_XP[rankIndex];
    }

    getRandomEnemy() {
        return Math.floor(Math.random() * 3) + 1;
    }

    generateEnemyCount(enemyType) {
        return enemyType === 1 ? Math.floor(Math.random() * 21) + 10 :
               enemyType === 2 ? Math.floor(Math.random() * 6) + 5 : 1;
    }

    calculateEnemyXP(enemyType, rankInfo, count) {
        const baseXP = count * (
            enemyType === 1 ? rankInfo.basicXP :
            enemyType === 2 ? rankInfo.strongXP :
            rankInfo.bossXP
        );
        return baseXP * this.getXPModifier(enemyType);
    }

    getXPModifier(enemyType) {
        return this.characterClass.xpModifier[this.getEnemyTypeName(enemyType)] || 1;
    }

    getEnemyTypeName(enemyType) {
        return ['basic', 'strong', 'boss'][enemyType - 1];
    }

    updateUI() {
        document.getElementById('dungeonCount').textContent = this.dungeonCount;
        document.getElementById('totalXP').textContent = this.totalDungeonXP;
        document.getElementById('totalNPCs').textContent = this.totalNPCs;
        document.getElementById('cancelButton').style.display = this.isRunning ? 'block' : 'none';
        this.updateProgressBar();
    }

    updateProgressBar() {
        const progress = Math.min(100, (this.currentLevel / this.targetLevel) * 100);
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    logDungeonResult(rankInfo, result) {
        const log = document.createElement('div');
        log.className = 'dungeon-log';
        log.innerHTML = `
            <div><strong>Dungeon ${this.dungeonCount}</strong> (Rank ${rankInfo.rank})</div>
            <div>Basic: ${result.npcKills.basic} | Strong: ${result.npcKills.strong} | Boss: ${result.npcKills.boss}</div>
            <div>XP Earned: ${result.xpEarned}</div>
            <div>Boss Success: ${result.bossSuccess ? 'Yes' : 'No'}</div>
        `;
        document.getElementById('dungeonDetails').prepend(log);
    }

    toggleDetails() {
        const details = document.getElementById('dungeonDetails');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
        document.getElementById('toggleDetails').textContent =
            details.style.display === 'none' ? 'Show Details' : 'Hide Details';
    }

    cancel() {
        this.isRunning = false;
        this.updateUI();
    }

    resetState() {
        this.currentLevel = 0;
        this.totalXP = 0;
        this.totalNPCs = 0;
        this.dungeonCount = 0;
        this.totalDungeonXP = 0;
        document.getElementById('dungeonDetails').innerHTML = '';
        this.updateUI();
    }

    getState() {
        return {
            currentLevel: this.currentLevel,
            dungeonCount: this.dungeonCount,
            totalXP: this.totalXP,
            totalNPCs: this.totalNPCs,
            characterClass: this.characterClass
        };
    }

    loadProgress() {
        const saved = StorageService.load();
        if (saved) {
            Object.assign(this, saved);
            this.updateUI();
        }
    }
}

class CharacterClass {
    static CLASSES = {
        warrior: { xpModifier: { boss: 1.2, basic: 0.9 } },
        mage: { xpModifier: { basic: 1.3, strong: 0.8 } }
    };
}

class ProgressChart {
    constructor() {
        this.ctx = document.getElementById('progressChart').getContext('2d');
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Level Progress',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)'
                }]
            }
        });
    }

    update(level) {
        this.chart.data.labels.push(`Dungeon ${this.chart.data.labels.length + 1}`);
        this.chart.data.datasets[0].data.push(level);
        this.chart.update();
    }
}

class StorageService {
    static save(state) {
        localStorage.setItem('dungeonState', JSON.stringify(state));
    }

    static load() {
        return JSON.parse(localStorage.getItem('dungeonState')) || null;
    }
}

const simulator = new DungeonSimulator();

document.getElementById('themeButton').addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
});