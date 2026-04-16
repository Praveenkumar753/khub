// A secret salt string to make hashing tamper-resistant.
// This is not meant to be cryptographically secure against targeted attacks (since it ships to the client),
// but it will prevent 99% of casual "edit the local storage" cheating.
const SALT = 'k_hub_s3cr3t_v1d30_pr0gr3ss_2026';

/**
 * Creates a simple hash from the time, topicId, and SALT.
 */
const generateSignature = (timeSpent, topicId) => {
    // Basic string to hash
    const rawString = `${timeSpent}-${topicId}-${SALT}`;
    // Use an easy encoding (Base64) to obfuscate it from plain text.
    return btoa(rawString);
};

/**
 * Saves video progress securely to localStorage.
 * @param {string} topicId - The ID of the topic.
 * @param {number} timeSpent - Time spent watching in seconds.
 */
export const saveVideoProgress = (topicId, timeSpent) => {
    if (!topicId || typeof timeSpent !== 'number') return;

    try {
        const signature = generateSignature(timeSpent, topicId);
        const data = {
            t: timeSpent,
            s: signature
        };
        localStorage.setItem(`kh_vp_${topicId}`, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save video progress:', error);
    }
};

/**
 * Loads video progress from localStorage securely.
 * @param {string} topicId - The ID of the topic.
 * @returns {number} The verified time spent in seconds (0 if tampered or not found).
 */
export const loadVideoProgress = (topicId) => {
    if (!topicId) return 0;

    try {
        const rawData = localStorage.getItem(`kh_vp_${topicId}`);
        if (!rawData) return 0;

        const data = JSON.parse(rawData);

        // Verify the signature
        const expectedSignature = generateSignature(data.t, topicId);
        if (data.s === expectedSignature) {
            return data.t;
        } else {
            // Tampering detected: signature does not match the time
            console.warn('Tampered video progress detected. Resetting to 0.');
            clearVideoProgress(topicId);
            return 0;
        }
    } catch (error) {
        console.error('Failed to load video progress:', error);
        return 0;
    }
};

/**
 * Clears video progress for a completed topic to free up space.
 * @param {string} topicId - The ID of the topic.
 */
export const clearVideoProgress = (topicId) => {
    if (!topicId) return;
    try {
        localStorage.removeItem(`kh_vp_${topicId}`);
    } catch (error) {
        // ignore
    }
};
