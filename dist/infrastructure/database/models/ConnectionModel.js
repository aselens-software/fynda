"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ConnectionStatus_1 = require("../../../domain/enums/ConnectionStatus");
const ConnectionSchema = new mongoose_1.Schema({
    senderDiscordId: { type: String, required: true, index: true },
    receiverDiscordId: { type: String, required: true, index: true },
    status: { type: String, enum: Object.values(ConnectionStatus_1.ConnectionStatus), default: ConnectionStatus_1.ConnectionStatus.PENDING, index: true },
    senderGuildId: { type: String },
    senderChannelId: { type: String, index: true },
    receiverChannelId: { type: String, index: true },
    revealedUsers: [{ type: String }],
}, { timestamps: true });
// Ensure a user can only have one active interaction with another user at a time
ConnectionSchema.index({ senderDiscordId: 1, receiverDiscordId: 1 }, { unique: true });
// Compound index for pending request queries (receiverDiscordId + status)
ConnectionSchema.index({ receiverDiscordId: 1, status: 1 });
exports.ConnectionModel = mongoose_1.default.model('Connection', ConnectionSchema);
