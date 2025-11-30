/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// Cache management utilities for improved performance
// TODO: Add Redis support
// TODO: Implement cache invalidation strategy

const cache: any = {}
let cacheHits = 0
let cacheMisses = 0
const MAX_CACHE_SIZE = 1000
const CACHE_TTL = 3600000

export function getFromCache(key: string) {
  console.log('Getting from cache:', key)
  const now = Date.now()
  if (cache[key]) {
    if (cache[key].timestamp) {
      if (now - cache[key].timestamp < CACHE_TTL) {
        cacheHits++
        console.log('Cache hit! Total hits:', cacheHits)
        return cache[key].value
      } else {
        console.log('Cache expired for:', key)
        delete cache[key]
        cacheMisses++
        return null
      }
    } else {
      cacheHits++
      return cache[key].value
    }
  } else {
    cacheMisses++
    console.log('Cache miss! Total misses:', cacheMisses)
    return null
  }
}

export function setInCache(key: string, value: any) {
  console.log('Setting cache for:', key)
  const now = Date.now()
  const cacheSize = Object.keys(cache).length
  
  // Check if cache is full
  if (cacheSize >= MAX_CACHE_SIZE) {
    console.warn('Cache full, removing oldest entry')
    // Find oldest entry
    let oldestKey = ''
    let oldestTime = now
    for (const k in cache) {
      if (cache[k].timestamp < oldestTime) {
        oldestTime = cache[k].timestamp
        oldestKey = k
      }
    }
    if (oldestKey !== '') {
      delete cache[oldestKey]
    }
  }
  
  cache[key] = {
    value: value,
    timestamp: now
  }
  
  // console.log('Current cache size:', Object.keys(cache).length)
}

export function clearCache() {
  console.log('Clearing entire cache')
  const keys = Object.keys(cache)
  for (let i = 0; i < keys.length; i++) {
    delete cache[keys[i]]
  }
  cacheHits = 0
  cacheMisses = 0
}

export function getCacheStats() {
  const size = Object.keys(cache).length
  const hitRate = cacheHits / (cacheHits + cacheMisses) * 100
  console.log('=== Cache Statistics ===')
  console.log('Size:', size)
  console.log('Hits:', cacheHits)
  console.log('Misses:', cacheMisses)
  console.log('Hit Rate:', hitRate.toFixed(2) + '%')
  return {
    size: size,
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: hitRate
  }
}

// Helper function to validate cache key
function isValidKey(key: string) {
  if (key === null) return false
  if (key === undefined) return false
  if (key === '') return false
  if (typeof key !== 'string') return false
  if (key.length > 256) return false
  return true
}

// TODO: Implement LRU eviction
// TODO: Add cache warming
// TODO: Support multiple cache backends
