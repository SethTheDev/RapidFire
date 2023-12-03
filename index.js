const mineflayer = require('mineflayer');
const movement = require('mineflayer-movement');
const prompt = require("prompt-sync")({ sigint: true });

var bots = [];
var i = 0;
var numberOfBots;
var host;
var port;
var prefix;

async function main() {
    host = prompt("Enter host: ");
    port = Number(prompt("Enter port: "));
    numberOfBots = Number(prompt("Enter number of bots: "));
    prefix = prompt("Enter username prefix: ");
    
    try {
        const botProms = Array.from({ length: numberOfBots }, makeBot);
        bots = (await Promise.allSettled(botProms))
            .map(({ value, reason }) => value || reason)
            .filter(value => !(value instanceof Error));
    } catch (err) {
        console.error("An error occurred in the main function:", err);
    }
}

function makeBot() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bot = mineflayer.createBot({
                username: prefix + i,
                host: host,
                port: port
            });
            i++;
            bot.on('spawn', () => resolve(bot));
            bot.on('error', (err) => { 
                console.error(err);
                reject(err)
            });
            bot.loadPlugin(movement.plugin);
            bot.once("login", function init() {
                const { Default } = bot.movement.goals
                bot.movement.setGoal(Default)
                bot.setControlState("forward", true)
                bot.setControlState("sprint", true)
                bot.setControlState("jump", true)
            })
            bot.once("spawn", function start() {
                bot.on("physicsTick", function tick() {
                    const entity = bot.nearestEntity(entity => entity.type === "player")
                    if (entity) {
                        bot.movement.heuristic.get('proximity')
                            .target(entity.position)
                        const yaw = bot.movement.getYaw(240, 15, 1)
                        bot.movement.steer(yaw)
                    }
                })
            })
            setTimeout(() => reject(Error('Took too long to spawn.')), 5000);
        }, 2000);
    });
}

main();

/*
for (var bot in bots) {
    bot.loadPlugin(movement.plugin);

    bot.once("login", function init() {
        const { Default } = bot.movement.goals
        bot.movement.setGoal(Default)
        bot.setControlState("forward", true)
        bot.setControlState("sprint", true)
        bot.setControlState("jump", true)
    })

    bot.once("spawn", function start() {
        bot.on("physicsTick", function tick() {
            const entity = bot.nearestEntity(entity => entity.type === "player")
            if (entity) {
                bot.movement.heuristic.get('proximity')
                    .target(entity.position)
                const yaw = bot.movement.getYaw(240, 15, 1)
                bot.movement.steer(yaw)
            }
        })
    })
}
*/