"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopggUtil = void 0;
const logger_1 = require("../logger/logger");
class TopggUtil {
    static async hasVoted(userId) {
        const token = process.env.TOPGG_TOKEN;
        if (!token) {
            // If no token is provided, assume voted (for local dev/testing)
            return true;
        }
        try {
            const response = await fetch(`https://top.gg/api/bots/1530886185009021019/check?userId=${userId}`, {
                headers: {
                    Authorization: token
                }
            });
            if (!response.ok) {
                logger_1.logger.error({ status: response.statusText }, 'Top.gg API error');
                return true; // Fail open if Top.gg is down
            }
            const data = await response.json();
            return data.voted === 1;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Failed to check top.gg vote');
            return true; // Fail open
        }
    }
}
exports.TopggUtil = TopggUtil;
