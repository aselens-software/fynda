"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DISCORD_BOT_TOKEN: zod_1.z.string().min(1, 'Discord token is required'),
    DISCORD_CLIENT_ID: zod_1.z.string().min(1, 'Discord client ID is required'),
    MONGO_URI: zod_1.z.string().min(1, 'MongoDB URI is required').refine((val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'), 'MongoDB URI must start with mongodb:// or mongodb+srv://'),
    LOG_LEVEL: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    FEEDBACK_WEBHOOK_URL: zod_1.z.string().url().optional(),
    TOPGG_TOKEN: zod_1.z.string().optional(),
});
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment variables:', result.error.format());
        process.exit(1);
    }
    return result.data;
};
exports.config = parseEnv();
