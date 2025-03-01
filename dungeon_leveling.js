function enterLevel(targetLevel) {
    let currentLevel = 0;
    let totalXP = 0;
    let totalNPCs = 0;
    let dungeonCount = 0;
    let totalDungeonXP = 0;

    const levelXP = [
        { threshold: 1000, rank: 'E', basicXP: 1, strongXP: 5, bossXP: 30, bossChance: 0.8 },
        { threshold: 2000, rank: 'D', basicXP: 5, strongXP: 10, bossXP: 60, bossChance: 0.6 },
        { threshold: 3000, rank: 'C', basicXP: 10, strongXP: 15, bossXP: 90, bossChance: 0.6 },
        { threshold: 4000, rank: 'B', basicXP: 15, strongXP: 20, bossXP: 120, bossChance: 0.5 },
        { threshold: 5000, rank: 'A', basicXP: 20, strongXP: 25, bossXP: 150, bossChance: 0.4 },
        { threshold: 8000, rank: 'S', basicXP: 50, strongXP: 100, bossXP: 1000, bossChance: 0.3 }
    ];

    function getCurrentRankInfo(level) {
        return levelXP[Math.min(Math.floor(level / 5), levelXP.length - 1)];
    }

    function getRandomEnemy() {
        return Math.floor(Math.random() * 3) + 1;
    }

    function calculateXP(enemyType, rankInfo) {
        switch (enemyType) {
            case 1: // Basic
                let basicCount = Math.floor(Math.random() * 21) + 10;
                return basicCount * rankInfo.basicXP;
            case 2: // Strong
                let strongCount = Math.floor(Math.random() * 6) + 5;
                return strongCount * rankInfo.strongXP;
            case 3: // Boss
                return rankInfo.bossXP;
        }
    }

    function printDungeonStats(dungeonCount, rankInfo, npcKills, xpEarned, bossSuccess) {
        console.log(`Dungeon ${dungeonCount}:`);
        console.log(`Dungeon rank: ${rankInfo.rank}`);
        console.log(`NPCs killed in the dungeon:`);
        console.log(`Basic: ${npcKills.basic}`);
        console.log(`Strong: ${npcKills.strong}`);
        console.log(`Boss: ${npcKills.boss}`);
        console.log(`Earned XP: ${xpEarned}`);
        console.log(`Bonus: Player failed: ${!bossSuccess} \n`);
    }

    while (currentLevel < targetLevel) {
        dungeonCount++;
        const currentRankInfo = getCurrentRankInfo(currentLevel);
        let npcKills = { basic: 0, strong: 0, boss: 0 };
        let xpEarned = 0;

        for (let i = 0; i < 10; i++) {
            let enemyType = getRandomEnemy();
            let earnedXP = calculateXP(enemyType, currentRankInfo);
            xpEarned += earnedXP;
            if (enemyType === 1) npcKills.basic++;
            if (enemyType === 2) npcKills.strong++;
            if (enemyType === 3) npcKills.boss++;
        }

        totalXP += xpEarned;
        totalNPCs += npcKills.basic + npcKills.strong + npcKills.boss;
        totalDungeonXP += xpEarned;

        const bossSuccess = Math.random() < currentRankInfo.bossChance;
        if (!bossSuccess) {
            totalXP -= currentRankInfo.rank === 'E' ? 30 * currentLevel : 0;
        }

        printDungeonStats(dungeonCount, currentRankInfo, npcKills, xpEarned, bossSuccess);

        while (totalXP >= currentRankInfo.threshold) {
            totalXP -= currentRankInfo.threshold;
            currentLevel++;
        }
    }

    console.log(`You have to clean: ${dungeonCount} dungeons`);
    console.log(`Total XP earned: ${totalDungeonXP} XP`);
    console.log(`You have to kill at least: ${totalNPCs} NPCs`);
}

enterLevel(50);
