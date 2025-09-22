/**
 * Rate Limiter for OpenAQ API
 * Handles 60 requests/minute and 2000 requests/hour limits
 */

interface RateLimitInfo {
  used: number;
  remaining: number;
  limit: number;
  resetTime: number; // Unix timestamp when rate limit resets
}

interface RateLimitState {
  requestsThisMinute: number;
  requestsThisHour: number;
  minuteResetTime: number;
  hourResetTime: number;
  lastRequestTime: number;
}

export class OpenAQRateLimiter {
  private state: RateLimitState;
  private readonly minuteLimit = 60;
  private readonly hourLimit = 2000;
  
  constructor() {
    this.state = {
      requestsThisMinute: 0,
      requestsThisHour: 0,
      minuteResetTime: Date.now() + 60 * 1000,
      hourResetTime: Date.now() + 60 * 60 * 1000,
      lastRequestTime: 0
    };
  }

  /**
   * Check if we can make a request without exceeding rate limits
   */
  canMakeRequest(): boolean {
    this.updateCounters();
    return this.state.requestsThisMinute < this.minuteLimit && 
           this.state.requestsThisHour < this.hourLimit;
  }

  /**
   * Get the delay needed before making the next request
   */
  getRequiredDelay(): number {
    this.updateCounters();
    
    if (this.state.requestsThisMinute >= this.minuteLimit) {
      return this.state.minuteResetTime - Date.now();
    }
    
    if (this.state.requestsThisHour >= this.hourLimit) {
      return this.state.hourResetTime - Date.now();
    }
    
    return 0;
  }

  /**
   * Wait if necessary to avoid rate limit violations
   */
  async waitIfNeeded(): Promise<void> {
    const delay = this.getRequiredDelay();
    if (delay > 0) {
      console.log(`⏳ Rate limit approached, waiting ${Math.ceil(delay / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, delay + 100)); // Add 100ms buffer
    }
  }

  /**
   * Record a request and update state from API response headers
   */
  recordRequest(responseHeaders?: Record<string, string>): void {
    this.updateCounters();
    this.state.requestsThisMinute++;
    this.state.requestsThisHour++;
    this.state.lastRequestTime = Date.now();

    // Update from API response headers if available
    if (responseHeaders) {
      const used = parseInt(responseHeaders['x-ratelimit-used'] || '0');
      const remaining = parseInt(responseHeaders['x-ratelimit-remaining'] || '0');
      const limit = parseInt(responseHeaders['x-ratelimit-limit'] || '0');
      const reset = parseInt(responseHeaders['x-ratelimit-reset'] || '0');

      if (used && remaining && limit) {
        // Determine if this is minute or hour limit based on the numbers
        if (limit <= 100) {
          // Likely minute limit
          this.state.requestsThisMinute = used;
          if (reset) {
            this.state.minuteResetTime = Date.now() + (reset * 1000);
          }
        } else {
          // Likely hour limit  
          this.state.requestsThisHour = used;
          if (reset) {
            this.state.hourResetTime = Date.now() + (reset * 1000);
          }
        }
      }
    }

    this.logStatus();
  }

  /**
   * Handle 429 rate limit errors with exponential backoff
   */
  async handle429Error(responseHeaders?: Record<string, string>): Promise<void> {
    console.warn('⚠️ Rate limit exceeded (429), implementing backoff...');
    
    let waitTime = 60000; // Default 1 minute
    
    if (responseHeaders?.['x-ratelimit-reset']) {
      const resetSeconds = parseInt(responseHeaders['x-ratelimit-reset']);
      waitTime = resetSeconds * 1000 + 5000; // Add 5s buffer
    }
    
    console.log(`⏳ Waiting ${Math.ceil(waitTime / 1000)}s for rate limit reset...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  /**
   * Update request counters based on current time
   */
  private updateCounters(): void {
    const now = Date.now();
    
    // Reset minute counter if minute has passed
    if (now >= this.state.minuteResetTime) {
      this.state.requestsThisMinute = 0;
      this.state.minuteResetTime = now + 60 * 1000;
    }
    
    // Reset hour counter if hour has passed
    if (now >= this.state.hourResetTime) {
      this.state.requestsThisHour = 0;
      this.state.hourResetTime = now + 60 * 60 * 1000;
    }
  }

  /**
   * Log current rate limit status
   */
  private logStatus(): void {
    console.log(`📊 Rate limit status: ${this.state.requestsThisMinute}/${this.minuteLimit}/min, ${this.state.requestsThisHour}/${this.hourLimit}/hour`);
  }

  /**
   * Get current status for monitoring
   */
  getStatus(): {
    minuteUsage: { used: number; limit: number; remaining: number };
    hourUsage: { used: number; limit: number; remaining: number };
    canMakeRequest: boolean;
    nextResetTime: number;
  } {
    this.updateCounters();
    return {
      minuteUsage: {
        used: this.state.requestsThisMinute,
        limit: this.minuteLimit,
        remaining: this.minuteLimit - this.state.requestsThisMinute
      },
      hourUsage: {
        used: this.state.requestsThisHour,
        limit: this.hourLimit,
        remaining: this.hourLimit - this.state.requestsThisHour
      },
      canMakeRequest: this.canMakeRequest(),
      nextResetTime: Math.min(this.state.minuteResetTime, this.state.hourResetTime)
    };
  }
}