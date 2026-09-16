"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionChannelCache = void 0;
/**
 * In-memory cache for active connection channel IDs.
 * Prevents a MongoDB query on every single message in the server.
 * Uses a TTL-based expiration to avoid stale data.
 */
class ConnectionChannelCache {
    cache = new Map();
    DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
    /**
     * Get a cached connection request by channel ID.
     * Returns undefined on cache miss.
     */
    get(channelId) {
        const entry = this.cache.get(channelId);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(channelId);
            return undefined;
        }
        return entry.request;
    }
    /**
     * Cache a connection request for both its sender and receiver channel IDs.
     */
    set(request, ttlMs) {
        const ttl = ttlMs ?? this.DEFAULT_TTL_MS;
        const expiresAt = Date.now() + ttl;
        const entry = { request, expiresAt };
        if (request.senderChannelId) {
            this.cache.set(request.senderChannelId, entry);
        }
        if (request.receiverChannelId) {
            this.cache.set(request.receiverChannelId, entry);
        }
    }
    /**
     * Set a negative cache entry for a channel ID that has no active connection.
     * This avoids repeated DB lookups for non-connection channels.
     */
    setMiss(channelId, ttlMs) {
        // We store a null-like sentinel — the get() method will return undefined
        // because the entry won't have a valid request, but we use a separate map
        // to track known misses.
        this.missCache.set(channelId, Date.now() + (ttlMs ?? this.MISS_TTL_MS));
    }
    missCache = new Map();
    MISS_TTL_MS = 60 * 1000; // 1 minute for negative cache
    /**
     * Check if a channel ID is known to have no active connection.
     */
    isMiss(channelId) {
        const expiresAt = this.missCache.get(channelId);
        if (expiresAt === undefined)
            return false;
        if (Date.now() > expiresAt) {
            this.missCache.delete(channelId);
            return false;
        }
        return true;
    }
    /**
     * Invalidate all cache entries for a given connection request.
     */
    invalidate(request) {
        if (request.senderChannelId) {
            this.cache.delete(request.senderChannelId);
            this.missCache.delete(request.senderChannelId);
        }
        if (request.receiverChannelId) {
            this.cache.delete(request.receiverChannelId);
            this.missCache.delete(request.receiverChannelId);
        }
    }
    /**
     * Invalidate a specific channel ID.
     */
    invalidateChannel(channelId) {
        this.cache.delete(channelId);
        this.missCache.delete(channelId);
    }
}
exports.ConnectionChannelCache = ConnectionChannelCache;
