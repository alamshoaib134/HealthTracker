/**
 * Simple environment variable loader for browser environments
 * This should be loaded before databricks-ai.js
 */

// Create a process object if it doesn't exist (for browser compatibility)
if (typeof process === 'undefined') {
    window.process = {
        env: {}
    };
}

// Function to load environment variables from a server endpoint
async function loadEnvironmentVariables() {
    try {
        // In a real application, you would have a secure endpoint to load these
        // This is a placeholder - implement your own secure method
        const response = await fetch('/api/env-config');
        if (response.ok) {
            const envVars = await response.json();
            Object.assign(process.env, envVars);
        }
    } catch (error) {
        console.error('Failed to load environment variables:', error);
    }
}

// For development, you might want to load test variables
// NEVER include actual tokens here - this is just to show the structure
function loadTestEnvironment() {
    // Only use this in development, never in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        process.env.DATABRICKS_TOKEN = 'development_token_placeholder';
        process.env.DATABRICKS_BASE_URL = 'http://localhost:8000/mock-api';
    }
}

// Call this function as early as possible
function initEnvironment() {
    // For production, use the async method to load from server
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        loadEnvironmentVariables();
    } else {
        // For local development, use the test environment
        loadTestEnvironment();
    }
}

// Initialize the environment
initEnvironment();
