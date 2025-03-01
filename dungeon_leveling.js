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

    function getRandomEnemy() {
        return Math.floor(Math.random() * 3) + 1;
    }

    while (currentLevel < targetLevel) {
        dungeonCount++;
        let currentRankInfo = levelXP[Math.min(Math.floor(currentLevel / 5), 5)];

        let npcKills = { basic: 0, strong: 0, boss: 0 };
        let xpEarned = 0;

        for (let i = 0; i < 10; i++) {
            let enemyType = getRandomEnemy();
            switch (enemyType) {
                case 1:
                    let basicCount = Math.floor(Math.random() * 21) + 10;
                    npcKills.basic += basicCount;
                    xpEarned += currentRankInfo.basicXP * basicCount;
                    break;
                case 2:
                    let strongCount = Math.floor(Math.random() * 6) + 5;
                    npcKills.strong += strongCount;
                    xpEarned += currentRankInfo.strongXP * strongCount;
                    break;
                case 3:
                    npcKills.boss += 1;
                    xpEarned += currentRankInfo.bossXP;
                    break;
            }
        }

        totalXP += xpEarned;
        totalNPCs += npcKills.basic + npcKills.strong + npcKills.boss;
        totalDungeonXP += xpEarned;

        let bossSuccess = Math.random() < currentRankInfo.bossChance;
        if (!bossSuccess) {
            totalXP -= currentRankInfo.rank === 'E' ? 30 * currentLevel : 0;
        }

        console.log(`Dungeon ${dungeonCount}:`);
        console.log(`Dungeon rank: ${currentRankInfo.rank}`);
        console.log(`NPCs killed in the dungeon:`);
        console.log(`Basic: ${npcKills.basic}`);
        console.log(`Strong: ${npcKills.strong}`);
        console.log(`Boss: ${npcKills.boss}`);
        console.log(`Earned XP: ${xpEarned}`);
        console.log(`Bonus: Player failed: ${!bossSuccess} \n`);

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
