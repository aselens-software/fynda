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
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DiscoveryIntent_1 = require("../../../domain/enums/DiscoveryIntent");
const UserSchema = new mongoose_1.Schema({
    discordId: { type: String, required: true, unique: true, index: true },
    isDiscoverable: { type: Boolean, default: false, index: true },
    profile: {
        languages: [{ type: String }],
        interests: [{ type: String }],
        hobbies: [{ type: String }],
        games: [{ type: String }],
        activityTime: {
            startHour: { type: Number, min: 0, max: 23, default: 0 },
            endHour: { type: Number, min: 0, max: 23, default: 23 },
        },
        lookingFor: [{ type: String, enum: Object.values(DiscoveryIntent_1.DiscoveryIntent) }],
        bio: { type: String, maxlength: 500 },
    },
}, { timestamps: true });
exports.UserModel = mongoose_1.default.model('User', UserSchema);
