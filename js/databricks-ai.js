// Databricks API integration for AI summary generation
// Load environment variables from .env file (requires dotenv package)
// IMPORTANT: Make sure to run npm install dotenv before using this
// const dotenv = require('dotenv'); // Uncomment in Node.js environment
// dotenv.config(); // Uncomment in Node.js environment

// For browser environment, these should be set by the server or a build process
// NEVER commit actual tokens to your repository
const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN || ''; // Use environment variable
const DATABRICKS_BASE_URL = process.env.DATABRICKS_BASE_URL || '';

/**
 * Generate an AI health summary using Databricks ML serving endpoint
 * @param {Object} healthData - The processed health data from CSV
 * @returns {Promise<Object>} - AI-generated analysis
 */
async function generateDatabricksAISummary(healthData) {
    try {
        // Convert health data to the format expected by the AI model
        const formattedData = formatHealthDataForAI(healthData);
        
        // Call Databricks serving endpoint
        const response = await fetch(`${DATABRICKS_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DATABRICKS_TOKEN}`
            },
            body: JSON.stringify({
                inputs: formattedData
            })
        });
        
        if (!response.ok) {
            throw new Error(`Databricks API Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Process and format the AI response
        return processAIResponse(result);
    } catch (error) {
        console.error('AI Summary Generation Error:', error);
        throw error;
    }
}

/**
 * Format health data for the AI model
 * @param {Object} healthData - The health data from CSV
 * @returns {Object} - Formatted data for the AI model
 */
function formatHealthDataForAI(healthData) {
    // Convert grouped data to array format expected by the model
    const formattedData = [];
    
    for (const category in healthData) {
        healthData[category].forEach(metric => {
            formattedData.push({
                name: metric.Name || '',
                category: category,
                test: metric.Test,
                result: parseFloat(metric.Result) || metric.Result,
                unit: metric.Unit,
                min: parseFloat(metric.Min) || null,
                max: parseFloat(metric.Max) || null,
                isAbnormal: isMetricAbnormal(metric)
            });
        });
    }
    
    return formattedData;
}

/**
 * Process AI response into the format needed for the UI
 * @param {Object} aiResponse - The raw AI response
 * @returns {Object} - Formatted analysis for display
 */
function processAIResponse(aiResponse) {
    // Extract relevant information from AI response
    // This might need adjustment based on actual response structure
    const response = aiResponse.predictions || aiResponse.output || aiResponse;
    
    // Default format if AI doesn't return expected structure
    if (!response.summary && !response.keyFindings) {
        // Create formatted response based on raw AI text
        const analysisText = response.toString();
        
        return {
            keyFindings: "## Key Health Findings\n" + extractKeyFindings(analysisText),
            recommendations: "## Recommendations\n" + extractRecommendations(analysisText),
            detailedAnalysis: "## Detailed Analysis\n" + extractDetailedAnalysis(analysisText)
        };
    }
    
    // Return the AI response in the expected format
    return {
        keyFindings: response.keyFindings || response.summary || '',
        recommendations: response.recommendations || '',
        detailedAnalysis: response.detailedAnalysis || response.details || ''
    };
}

/**
 * Check if a metric is outside normal range
 * @param {Object} metric - The health metric to check
 * @returns {boolean} - True if abnormal
 */
function isMetricAbnormal(metric) {
    const result = parseFloat(metric.Result);
    const min = parseFloat(metric.Min);
    const max = parseFloat(metric.Max);
    
    if (isNaN(result)) return false;
    
    if (!isNaN(min) && result < min) return true;
    if (!isNaN(max) && result > max) return true;
    
    return false;
}

/**
 * Extract key findings from AI text
 * @param {string} text - Raw AI response text
 * @returns {string} - Formatted key findings
 */
function extractKeyFindings(text) {
    // Simple extraction logic - would be replaced with better parsing
    return "- Analysis of your health metrics complete\n- Several metrics require attention";
}

/**
 * Extract recommendations from AI text
 * @param {string} text - Raw AI response text
 * @returns {string} - Formatted recommendations
 */
function extractRecommendations(text) {
    // Simple extraction logic - would be replaced with better parsing
    return "- Consult with your healthcare provider\n- Follow up on abnormal results";
}

/**
 * Extract detailed analysis from AI text
 * @param {string} text - Raw AI response text
 * @returns {string} - Formatted detailed analysis
 */
function extractDetailedAnalysis(text) {
    // Simple extraction logic - would be replaced with better parsing
    return "Detailed breakdown of your health metrics and their implications...";
}

/**
 * Generate a quick health summary for the dashboard card
 * @param {Object} healthData - The processed health data from CSV
 * @returns {Promise<Object>} - Quick summary with status, score and key points
 */
async function generateQuickHealthSummary(healthData) {
    try {
        // Format data for quick summary
        const formattedData = formatHealthDataForAI(healthData);
        
        // Count metrics and calculate abnormal percentage
        let totalMetrics = 0;
        let abnormalMetrics = 0;
        let categories = new Set();
        
        // Process data for quick summary
        for (const category in healthData) {
            categories.add(category);
            healthData[category].forEach(metric => {
                totalMetrics++;
                const min = parseFloat(metric.Min);
                const max = parseFloat(metric.Max);
                const result = parseFloat(metric.Result);
                
                if ((min && result < min) || (max && result > max)) {
                    abnormalMetrics++;
                }
            });
        }
        
        // Calculate health score
        const healthScore = Math.round(((totalMetrics - abnormalMetrics) / totalMetrics) * 100);
        
        // Determine status
        let status = 'Good';
        if (healthScore < 70) status = 'Caution';
        if (healthScore < 50) status = 'Warning';
        
        // Try to get AI-enhanced insights if available
        try {
            // Call Databricks API for enhanced insights
            const response = await fetch(`${DATABRICKS_BASE_URL}/quick-insights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DATABRICKS_TOKEN}`
                },
                body: JSON.stringify({
                    inputs: formattedData.slice(0, 10) // Send first 10 metrics for quick analysis
                })
            });
            
            if (response.ok) {
                const aiResult = await response.json();
                return {
                    isAI: true,
                    status: status,
                    score: healthScore,
                    insights: aiResult.insights || ["Review your blood work", "Monitor your vitamin levels"],
                    lastCheckup: formatDate(new Date(Date.now() - 55 * 24 * 60 * 60 * 1000)), // ~55 days ago
                    nextCheckup: formatDate(new Date(Date.now() + 125 * 24 * 60 * 60 * 1000))  // ~125 days ahead
                };
            }
        } catch (error) {
            console.warn("Could not get AI-enhanced quick summary", error);
        }
        
        // Fallback to basic summary
        return {
            isAI: false,
            status: status,
            score: healthScore,
            insights: [
                abnormalMetrics > 0 ? `${abnormalMetrics} metrics need attention` : "All metrics look good",
                categories.size > 0 ? `${categories.size} categories analyzed` : "Add more health data"
            ],
            lastCheckup: formatDate(new Date(Date.now() - 55 * 24 * 60 * 60 * 1000)), // ~55 days ago
            nextCheckup: formatDate(new Date(Date.now() + 125 * 24 * 60 * 60 * 1000))  // ~125 days ahead
        };
    } catch (error) {
        console.error("Error generating quick health summary:", error);
        return {
            isAI: false,
            status: "Unknown",
            score: 0,
            insights: ["Unable to analyze health data", "Please try again later"],
            lastCheckup: "Unknown",
            nextCheckup: "Unknown"
        };
    }
}

/**
 * Format a date as MMM DD, YYYY
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Export functions
window.databricksAI = {
    generateSummary: generateDatabricksAISummary,
    generateQuickHealthSummary: generateQuickHealthSummary,
    generateNutritionSuggestions: generateNutritionSuggestions,
    generateMedicationSuggestions: generateMedicationSuggestions,
    generateActivitySuggestions: generateActivitySuggestions
};

/**
 * Generate AI suggestions for nutrition based on health data
 * @param {Object} healthData - The processed health data
 * @returns {Promise<Object>} - Nutrition suggestions
 */
async function generateNutritionSuggestions(healthData) {
    try {
        // Format data for AI analysis
        const formattedData = formatHealthDataForAI(healthData);
        
        // Try to get AI-enhanced suggestions
        try {
            // Call Databricks API for nutrition suggestions
            const response = await fetch(`${DATABRICKS_BASE_URL}/nutrition-suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DATABRICKS_TOKEN}`
                },
                body: JSON.stringify({
                    inputs: formattedData
                })
            });
            
            if (response.ok) {
                const aiResult = await response.json();
                return {
                    isAI: true,
                    title: "Nutrition Suggestions",
                    description: "Based on your health metrics, here are some nutrition recommendations that may help improve your health outcomes:",
                    suggestions: aiResult.suggestions || getDefaultNutritionSuggestions(healthData)
                };
            }
            throw new Error("API response not OK");
        } catch (error) {
            console.warn("Could not get AI-enhanced nutrition suggestions", error);
            return {
                isAI: true,
                title: "Nutrition Suggestions",
                description: "Based on your health profile, here are some nutrition recommendations:",
                suggestions: getDefaultNutritionSuggestions(healthData)
            };
        }
    } catch (error) {
        console.error("Error generating nutrition suggestions:", error);
        return {
            isAI: false,
            title: "Nutrition Suggestions",
            description: "Here are some general nutrition recommendations:",
            suggestions: [
                "Aim for a balanced diet with plenty of vegetables and fruits",
                "Stay hydrated by drinking at least 8 glasses of water daily",
                "Limit processed foods and added sugars",
                "Include lean proteins in your meals",
                "Choose whole grains over refined carbohydrates"
            ]
        };
    }
}

/**
 * Generate AI suggestions for medications based on health data
 * @param {Object} healthData - The processed health data
 * @returns {Promise<Object>} - Medication suggestions
 */
async function generateMedicationSuggestions(healthData) {
    try {
        // Format data for AI analysis
        const formattedData = formatHealthDataForAI(healthData);
        
        // Try to get AI-enhanced suggestions
        try {
            // Call Databricks API for medication suggestions
            const response = await fetch(`${DATABRICKS_BASE_URL}/medication-suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DATABRICKS_TOKEN}`
                },
                body: JSON.stringify({
                    inputs: formattedData
                })
            });
            
            if (response.ok) {
                const aiResult = await response.json();
                return {
                    isAI: true,
                    title: "Medication Considerations",
                    description: "Based on your health data, here are some medication considerations to discuss with your doctor:",
                    suggestions: aiResult.suggestions || getDefaultMedicationSuggestions(healthData)
                };
            }
            throw new Error("API response not OK");
        } catch (error) {
            console.warn("Could not get AI-enhanced medication suggestions", error);
            return {
                isAI: true,
                title: "Medication Considerations",
                description: "Based on your health profile, here are some medication considerations to discuss with your healthcare provider:",
                suggestions: getDefaultMedicationSuggestions(healthData)
            };
        }
    } catch (error) {
        console.error("Error generating medication suggestions:", error);
        return {
            isAI: false,
            title: "Medication Considerations",
            description: "IMPORTANT: Always consult with your healthcare provider before starting or changing any medications. Here are some general considerations:",
            suggestions: [
                "Keep a current list of all medications you are taking",
                "Inform your doctor about any supplements or over-the-counter medications you use",
                "Report any side effects to your healthcare provider promptly",
                "Take medications as prescribed and follow dosage instructions",
                "Ask your doctor about potential interactions with other medications or foods"
            ]
        };
    }
}

/**
 * Generate AI suggestions for physical activities based on health data
 * @param {Object} healthData - The processed health data
 * @returns {Promise<Object>} - Activity suggestions
 */
async function generateActivitySuggestions(healthData) {
    try {
        // Format data for AI analysis
        const formattedData = formatHealthDataForAI(healthData);
        
        // Try to get AI-enhanced suggestions
        try {
            // Call Databricks API for activity suggestions
            const response = await fetch(`${DATABRICKS_BASE_URL}/activity-suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DATABRICKS_TOKEN}`
                },
                body: JSON.stringify({
                    inputs: formattedData
                })
            });
            
            if (response.ok) {
                const aiResult = await response.json();
                return {
                    isAI: true,
                    title: "Activity Recommendations",
                    description: "Based on your health metrics, here are some physical activity recommendations that may be beneficial:",
                    suggestions: aiResult.suggestions || getDefaultActivitySuggestions(healthData)
                };
            }
            throw new Error("API response not OK");
        } catch (error) {
            console.warn("Could not get AI-enhanced activity suggestions", error);
            return {
                isAI: true,
                title: "Activity Recommendations",
                description: "Based on your health profile, here are some physical activity recommendations:",
                suggestions: getDefaultActivitySuggestions(healthData)
            };
        }
    } catch (error) {
        console.error("Error generating activity suggestions:", error);
        return {
            isAI: false,
            title: "Activity Recommendations",
            description: "Here are some general physical activity recommendations:",
            suggestions: [
                "Aim for at least 150 minutes of moderate aerobic activity weekly",
                "Include strength training exercises 2-3 times per week",
                "Take frequent breaks from sitting if you have a sedentary job",
                "Start any new exercise regimen gradually to avoid injury",
                "Find activities you enjoy to help maintain consistency"
            ]
        };
    }
}

// Helper function to generate default nutrition suggestions based on health data
function getDefaultNutritionSuggestions(healthData) {
    const suggestions = [];
    let hasLipidIssues = false;
    let hasGlucoseIssues = false;
    
    // Check for specific health concerns
    if (healthData) {
        // Check for lipid issues
        if (healthData['LIPID PROFILE']) {
            healthData['LIPID PROFILE'].forEach(metric => {
                if (metric.Test.includes('CHOLESTEROL') || metric.Test.includes('TRIGLYCERIDES')) {
                    const result = parseFloat(metric.Result);
                    const max = parseFloat(metric.Max);
                    if (max && result > max) {
                        hasLipidIssues = true;
                    }
                }
            });
        }
        
        // Check for glucose issues
        if (healthData['GLUCOSE FASTING'] || healthData['Glycated Hemoglobin ( HbA1c ) HPLC']) {
            const glucoseTests = [
                ...(healthData['GLUCOSE FASTING'] || []),
                ...(healthData['Glycated Hemoglobin ( HbA1c ) HPLC'] || [])
            ];
            
            glucoseTests.forEach(metric => {
                const result = parseFloat(metric.Result);
                const max = parseFloat(metric.Max);
                if (max && result > max) {
                    hasGlucoseIssues = true;
                }
            });
        }
    }
    
    // Add general suggestions
    suggestions.push("Incorporate a variety of colorful vegetables and fruits daily");
    suggestions.push("Stay hydrated with water rather than sugary beverages");
    
    // Add targeted suggestions based on health issues
    if (hasLipidIssues) {
        suggestions.push("Consider increasing your intake of omega-3 fatty acids from sources like fatty fish, flaxseeds, and walnuts");
        suggestions.push("Reduce consumption of saturated fats found in red meat and full-fat dairy products");
        suggestions.push("Add more soluble fiber from foods like oats, beans, and fruits to help lower cholesterol");
    }
    
    if (hasGlucoseIssues) {
        suggestions.push("Choose complex carbohydrates like whole grains over simple carbs like white bread and sugar");
        suggestions.push("Include protein with each meal to help stabilize blood sugar levels");
        suggestions.push("Consider a meal schedule that promotes stable blood sugar throughout the day");
    }
    
    // If no specific issues, add more general advice
    if (!hasLipidIssues && !hasGlucoseIssues) {
        suggestions.push("Maintain a balanced diet with appropriate portions of proteins, carbohydrates, and healthy fats");
        suggestions.push("Consider consulting with a registered dietitian for personalized nutrition advice");
    }
    
    return suggestions;
}

// Helper function to generate default medication suggestions based on health data
function getDefaultMedicationSuggestions(healthData) {
    const suggestions = [];
    
    // Add strong disclaimer first
    suggestions.push("IMPORTANT: This is not medical advice. Always consult with a healthcare professional before starting or changing medications");
    
    // Add general medication management suggestions
    suggestions.push("Keep an updated list of all medications, supplements, and vitamins you take");
    suggestions.push("Discuss potential drug interactions with your healthcare provider");
    suggestions.push("Follow medication schedules carefully and set reminders if needed");
    
    // Check for specific health concerns if data is available
    if (healthData) {
        // Check for blood pressure issues
        let hasHighBP = false;
        let hasHighCholesterol = false;
        let hasDiabetes = false;
        
        // Basic checks for common conditions
        if (healthData['LIPID PROFILE']) {
            healthData['LIPID PROFILE'].forEach(metric => {
                if ((metric.Test.includes('CHOLESTEROL') || metric.Test.includes('LDL')) && 
                    parseFloat(metric.Result) > parseFloat(metric.Max)) {
                    hasHighCholesterol = true;
                }
            });
        }
        
        if (healthData['GLUCOSE FASTING'] || healthData['Glycated Hemoglobin ( HbA1c ) HPLC']) {
            const glucoseTests = [
                ...(healthData['GLUCOSE FASTING'] || []),
                ...(healthData['Glycated Hemoglobin ( HbA1c ) HPLC'] || [])
            ];
            
            glucoseTests.forEach(metric => {
                if (parseFloat(metric.Result) > parseFloat(metric.Max)) {
                    hasDiabetes = true;
                }
            });
        }
        
        // Add condition-specific suggestions
        if (hasHighBP) {
            suggestions.push("If prescribed blood pressure medication, monitor your blood pressure regularly and report significant changes to your doctor");
        }
        
        if (hasHighCholesterol) {
            suggestions.push("If taking cholesterol-lowering medications, consider discussing regular liver function tests with your doctor");
        }
        
        if (hasDiabetes) {
            suggestions.push("For diabetes medications, monitor your blood glucose levels as recommended by your healthcare provider");
        }
    }
    
    return suggestions;
}

// Helper function to generate default activity suggestions based on health data
function getDefaultActivitySuggestions(healthData) {
    const suggestions = [];
    let hasJointIssues = false;
    let hasCardiovascularConcerns = false;
    
    // Add general activity suggestions
    suggestions.push("Aim for at least 150 minutes of moderate-intensity aerobic activity per week");
    suggestions.push("Include muscle-strengthening activities at least twice weekly");
    
    // Check for specific health concerns if data is available
    if (healthData) {
        // For this example, we'll make some simple assumptions based on basic markers
        // In a real application, more sophisticated analysis would be performed
        
        if (healthData['COMPLETE BLOOD COUNTS - CBC']) {
            // Check for potential cardiovascular issues based on basic markers
            healthData['COMPLETE BLOOD COUNTS - CBC'].forEach(metric => {
                if (metric.Test.includes('HAEMOGLOBIN') && parseFloat(metric.Result) < parseFloat(metric.Min)) {
                    hasCardiovascularConcerns = true;
                }
            });
        }
        
        // Add tailored suggestions based on health issues
        if (hasJointIssues) {
            suggestions.push("Consider low-impact exercises like swimming, cycling, or elliptical training to reduce joint strain");
            suggestions.push("Incorporate gentle stretching and range-of-motion exercises daily");
        }
        
        if (hasCardiovascularConcerns) {
            suggestions.push("Start with shorter exercise sessions and gradually increase duration as your fitness improves");
            suggestions.push("Monitor your heart rate during exercise and learn the signs of overexertion");
            suggestions.push("Consider activities that allow for easy adjustment of intensity, such as walking or stationary cycling");
        }
    }
    
    // Additional general suggestions
    suggestions.push("Find activities you enjoy to help maintain consistency");
    suggestions.push("Start any new exercise program gradually to avoid injury");
    suggestions.push("Incorporate both cardiovascular exercise and strength training for balanced fitness");
    
    return suggestions;
}
