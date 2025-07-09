document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initializeUIComponents();
    
    // Initialize charts on the dashboard
    initializeDashboardCharts();
    
    // Set up CSV upload handling
    setupCSVHandling();
    
    // Set up health summary generation
    setupHealthSummary();
    
    // Set up Quick Action buttons
    setupQuickActionButtons();
    
    // Set up export functionality
    setupExportFunctionality();
    
    // Set up expand/collapse section controls
    setupSectionControls();
    
    // Initialize sample user data
    initializeSampleUserData();
    
    // Load Shoaib's health data if available
    loadShoaibHealthData();
    
    // Show console message about removed section
    console.log("'Health Metrics Overview' section has been removed as requested");
});

// Global variable to store processed data
let groupedData = {};

function initializeUIComponents() {
    // Theme toggle functionality can be implemented here
    const themeToggle = document.getElementById('themeToggle');
    // Additional UI initializations
}

function initializeDashboardCharts() {
    // Blood Pressure Chart
    const bpCtx = document.getElementById('bpChart').getContext('2d');
    const bpChart = new Chart(bpCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Systolic',
                    data: [128, 130, 132, 135, 132, 130],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Diastolic',
                    data: [80, 82, 84, 85, 84, 82],
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 150
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Heart Rate Chart
    const hrCtx = document.getElementById('hrChart').getContext('2d');
    const hrChart = new Chart(hrCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Heart Rate (bpm)',
                data: [75, 74, 72, 73, 72, 71],
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 90
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Cholesterol Chart
    const cholCtx = document.getElementById('cholChart').getContext('2d');
    const cholChart = new Chart(cholCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Total Cholesterol (mg/dL)',
                data: [210, 205, 200, 195, 190, 188],
                backgroundColor: 'rgba(234, 179, 8, 0.7)',
                borderColor: 'rgba(234, 179, 8, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 150,
                    max: 220
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function setupCSVHandling() {
    const csvUpload = document.getElementById('csvUpload');
    const csvResults = document.getElementById('csvResults');
    const metricsContainer = document.getElementById('metricsContainer');

    function handleCSVUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target.result;
            processCSV(csvData);
        };
        reader.readAsText(file);
    }

    csvUpload.addEventListener('change', handleCSVUpload);

    function processCSV(csvData) {
        // Parse CSV
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        const results = [];
        
        let userName = '';
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            
            const obj = {};
            const currentline = lines[i].split(',');
            
            // Extract username from first column if not already set
            if (!userName && currentline[0] && headers[0].trim() === 'Name') {
                userName = currentline[0].trim();
            }
            
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim()] = currentline[j] ? currentline[j].trim() : '';
            }
            
            results.push(obj);
        }
        
        // Update the user name in the UI if found
        if (userName) {
            // Extract first name for welcome message
            const firstName = userName.split(' ')[0];
            document.getElementById('userName').textContent = firstName;
            
            // Update profile form if it exists
            if (document.getElementById('fullName')) {
                document.getElementById('fullName').value = userName;
            }
        }
        
        // Group by category
        groupedData = {}; // Reset groupedData
        results.forEach(item => {
            if (!groupedData[item.Category]) {
                groupedData[item.Category] = [];
            }
            groupedData[item.Category].push(item);
        });
        
        // Display results
        displayResults(groupedData);
    }

    function displayResults(groupedData) {
        metricsContainer.innerHTML = '';
        
        // Update the Health Summary Card with AI-enhanced insights
        updateHealthSummaryCard(groupedData);
        
        for (const category in groupedData) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'bg-gray-50 rounded-lg p-4';
            
            // Create collapsible header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'collapsible-header';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'text-lg font-semibold text-gray-800';
            const metricCount = groupedData[category].length;
            categoryTitle.textContent = `${category} (${metricCount} ${metricCount === 1 ? 'metric' : 'metrics'})`;
            
            const toggleIcon = document.createElement('i');
            toggleIcon.className = 'fas fa-chevron-down collapsible-icon';
            
            headerDiv.appendChild(categoryTitle);
            headerDiv.appendChild(toggleIcon);
            categoryDiv.appendChild(headerDiv);
            
            // Create content container
            const contentDiv = document.createElement('div');
            contentDiv.className = 'metrics-content';
            
            const metricsDiv = document.createElement('div');
            metricsDiv.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
            
            // Add toggle functionality
            headerDiv.addEventListener('click', () => {
                categoryDiv.classList.toggle('collapsed');
            });
            
            groupedData[category].forEach(metric => {
                const metricCard = document.createElement('div');
                metricCard.className = 'bg-white rounded-lg p-4 shadow-sm relative';
                
                const metricName = document.createElement('h4');
                metricName.className = 'font-medium text-gray-800 mb-2 pr-6';
                metricName.textContent = metric.Test;
                metricCard.appendChild(metricName);

                // Add edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'absolute top-2 right-2 text-gray-400 hover:text-blue-500';
                editBtn.innerHTML = '<i class="fas fa-pencil-alt text-sm"></i>';
                editBtn.addEventListener('click', () => editMetric(metric, metricCard));
                metricCard.appendChild(editBtn);
                
                const resultDiv = document.createElement('div');
                resultDiv.className = 'flex justify-between items-center mb-2';
                
                const resultValue = document.createElement('span');
                resultValue.className = 'text-xl font-bold';
                resultValue.textContent = `${metric.Result} ${metric.Unit}`;
                
                // Determine status color
                const min = parseFloat(metric.Min);
                const max = parseFloat(metric.Max);
                const result = parseFloat(metric.Result);
                let statusClass = 'bg-green-100 text-green-800';
                
                if (result < min) {
                    statusClass = 'bg-orange-100 text-orange-800';
                } else if (result > max) {
                    statusClass = 'bg-red-100 text-red-800';
                }
                
                const statusSpan = document.createElement('span');
                statusSpan.className = `text-xs px-2 py-1 rounded-full ${statusClass}`;
                statusSpan.textContent = result < min ? 'Low' : (result > max ? 'High' : 'Normal');
                
                resultDiv.appendChild(resultValue);
                resultDiv.appendChild(statusSpan);
                metricCard.appendChild(resultDiv);
                
                // Range indicator
                const rangeDiv = document.createElement('div');
                rangeDiv.className = 'mt-2';
                
                const rangeText = document.createElement('p');
                rangeText.className = 'text-sm text-gray-600 mb-1';
                rangeText.textContent = `Normal range: ${metric.Min} - ${metric.Max} ${metric.Unit}`;
                rangeDiv.appendChild(rangeText);
                
                // Visual range indicator
                const indicatorDiv = document.createElement('div');
                indicatorDiv.className = 'w-full bg-gray-200 rounded-full h-2.5';
                
                const indicatorBar = document.createElement('div');
                indicatorBar.className = 'h-2.5 rounded-full';
                
                // Calculate position
                const range = max - min;
                const position = ((result - min) / range) * 100;
                
                if (result < min) {
                    indicatorBar.className += ' bg-orange-500';
                    indicatorBar.style.width = '10%';
                } else if (result > max) {
                    indicatorBar.className += ' bg-red-500';
                    indicatorBar.style.width = '100%';
                } else {
                    indicatorBar.className += ' bg-green-500';
                    indicatorBar.style.width = `${position}%`;
                }
                
                indicatorDiv.appendChild(indicatorBar);
                rangeDiv.appendChild(indicatorDiv);
                metricCard.appendChild(rangeDiv);
                
                metricsDiv.appendChild(metricCard);
            });
            
            contentDiv.appendChild(metricsDiv);
            categoryDiv.appendChild(contentDiv);
            metricsContainer.appendChild(categoryDiv);
        }
        
        // Initialize collapsible functionality after metrics are displayed
        initializeCollapsibleSections();
        
        csvResults.classList.remove('hidden');
    }

    function editMetric(metric, card) {
        const currentValue = metric.Result;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'border rounded px-2 py-1 text-sm w-20';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'ml-2 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600';
        saveBtn.textContent = 'Save';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300';
        cancelBtn.textContent = 'Cancel';
        
        const editContainer = document.createElement('div');
        editContainer.className = 'mt-2 flex items-center';
        editContainer.appendChild(input);
        editContainer.appendChild(saveBtn);
        editContainer.appendChild(cancelBtn);
        
        // Replace the result display with edit controls
        const resultDiv = card.querySelector('.flex.justify-between');
        const originalContent = resultDiv.innerHTML;
        resultDiv.innerHTML = '';
        resultDiv.appendChild(editContainer);
        
        saveBtn.addEventListener('click', () => {
            metric.Result = input.value;
            // Update the groupedData with the new value
            for (const category in groupedData) {
                const index = groupedData[category].findIndex(m => m.Test === metric.Test);
                if (index !== -1) {
                    groupedData[category][index].Result = input.value;
                    break;
                }
            }
            displayResults(groupedData); // Refresh display with updated data
        });
        
        cancelBtn.addEventListener('click', () => {
            resultDiv.innerHTML = originalContent;
        });
    }
}

function setupHealthSummary() {
    // AI Summary Elements
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    const refreshSummaryBtn = document.getElementById('refreshSummaryBtn');
    const aiSummary = document.getElementById('aiSummary');
    const summaryContent = document.getElementById('summaryContent');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const summaryText = document.getElementById('summaryText');
    const summaryIcon = document.getElementById('summaryIcon');

    async function generateHealthSummary() {
        if (!groupedData || Object.keys(groupedData).length === 0) {
            alert('Please upload health data first');
            return;
        }

        try {
            // Show loading state
            generateSummaryBtn.disabled = true;
            summaryIcon.className = 'fas fa-spinner fa-spin';
            document.getElementById('summaryText').textContent = 'Analyzing...';
            aiSummary.classList.remove('hidden');
            loadingIndicator.classList.remove('hidden');
            summaryText.classList.add('hidden');

            // Try to use Databricks AI if available, fall back to local analysis
            let analysis;
            
            try {
                if (window.databricksAI && typeof window.databricksAI.generateSummary === 'function') {
                    // Use Databricks AI for enhanced analysis
                    console.log("Using Databricks AI for analysis...");
                    document.getElementById('aiBadge').classList.remove('hidden');
                    document.getElementById('aiSourceInfo').textContent = "Processing with Databricks AI...";
                    
                    analysis = await window.databricksAI.generateSummary(groupedData);
                    console.log("Databricks AI analysis complete:", analysis);
                    
                    // Show the Databricks AI badge
                    document.querySelectorAll('.ai-badge').forEach(badge => badge.classList.remove('hidden'));
                } else {
                    throw new Error("Databricks AI not available");
                }
            } catch (aiError) {
                console.warn("Databricks AI failed, falling back to local analysis:", aiError);
                // Fallback to local analysis
                document.getElementById('aiSourceInfo').textContent = "Using local analysis...";
                document.getElementById('aiBadge').classList.add('hidden');
                analysis = analyzeHealthData(groupedData);
            }
            
            // Display the analysis
            document.getElementById('keyFindings').innerHTML = marked.parse(analysis.keyFindings);
            document.getElementById('recommendations').innerHTML = marked.parse(analysis.recommendations);
            document.getElementById('detailedAnalysis').innerHTML = marked.parse(analysis.detailedAnalysis);
            
            // Hide loading and show results
            loadingIndicator.classList.add('hidden');
            summaryText.classList.remove('hidden');
            summaryContent.classList.remove('hidden');
            
            // Reset button state
            generateSummaryBtn.disabled = false;
            summaryIcon.className = 'fas fa-robot';
            document.getElementById('summaryText').textContent = 'Generate AI Summary';
            
            // Also update the Health Summary card with the fresh data
            updateHealthSummaryCard(groupedData);

        } catch (error) {
            console.error('Error generating summary:', error);
            loadingIndicator.innerHTML = '<p class="text-red-500">Failed to generate summary. Please try again.</p>';
            generateSummaryBtn.disabled = false;
            summaryIcon.className = 'fas fa-robot';
            document.getElementById('summaryText').textContent = 'Generate AI Summary';
        }
    }

    function analyzeHealthData(data) {
        // Initialize analysis variables
        let abnormalCount = 0;
        const abnormalMetrics = [];
        const trends = {};
        const categories = {};
        
        // Process each category
        for (const category in data) {
            categories[category] = { normal: 0, abnormal: 0 };
            
            data[category].forEach(metric => {
                const min = parseFloat(metric.Min);
                const max = parseFloat(metric.Max);
                const result = parseFloat(metric.Result);
                
                // Track abnormal metrics
                if (result < min || result > max) {
                    abnormalCount++;
                    abnormalMetrics.push({
                        name: metric.Test,
                        value: metric.Result + ' ' + metric.Unit,
                        status: result < min ? 'Low' : 'High',
                        normalRange: `${metric.Min} - ${metric.Max} ${metric.Unit}`
                    });
                    categories[category].abnormal++;
                } else {
                    categories[category].normal++;
                }
                
                // Track trends by test type
                if (!trends[metric.Test]) {
                    trends[metric.Test] = [];
                }
                trends[metric.Test].push({
                    date: metric.Date || 'Recent',
                    value: metric.Result
                });
            });
        }
        
        // Generate key findings
        let keyFindings = '';
        if (abnormalCount > 0) {
            keyFindings += `- **${abnormalCount} abnormal results** detected in your health metrics\n`;
            keyFindings += `- Most concerning metrics:\n`;
            abnormalMetrics.slice(0, 3).forEach(metric => {
                keyFindings += `  - **${metric.name}**: ${metric.value} (${metric.status}) - Normal range: ${metric.normalRange}\n`;
            });
        } else {
            keyFindings += `- All health metrics are within normal ranges\n`;
        }
        
        // Generate recommendations
        let recommendations = '';
        if (abnormalCount > 0) {
            recommendations += `- **Consult your doctor** about the ${abnormalCount} abnormal results\n`;
            recommendations += `- **Monitor closely**: ${abnormalMetrics.map(m => m.name).join(', ')}\n`;
            recommendations += `- Consider lifestyle changes based on your specific abnormal results\n`;
        } else {
            recommendations += `- Continue with your current health regimen\n`;
            recommendations += `- Maintain regular checkups to monitor your health\n`;
        }
        
        // Generate detailed analysis
        let detailedAnalysis = `### Category Breakdown:\n`;
        for (const category in categories) {
            const percentAbnormal = Math.round((categories[category].abnormal / 
                (categories[category].normal + categories[category].abnormal)) * 100);
            detailedAnalysis += `- **${category}**: ${categories[category].normal} normal, ${categories[category].abnormal} abnormal (${percentAbnormal}%)\n`;
        }
        
        detailedAnalysis += `\n### Trend Analysis:\n`;
        for (const test in trends) {
            if (trends[test].length > 1) {
                detailedAnalysis += `- **${test}**: ${trends[test].map(t => `${t.date}: ${t.value}`).join(' → ')}\n`;
            }
        }
        
        return {
            keyFindings,
            recommendations,
            detailedAnalysis
        };
    }

    // Add event listeners
    generateSummaryBtn.addEventListener('click', generateHealthSummary);
    refreshSummaryBtn.addEventListener('click', generateHealthSummary);
}

// Update the Health Summary Card with AI-enhanced data
async function updateHealthSummaryCard(data) {
    if (!data || Object.keys(data).length === 0) {
        return; // No data to process
    }
    
    try {
        // Target the health summary card elements
        const healthCard = document.querySelector('.health-card');
        const statusBadge = healthCard.querySelector('.health-card-status');
        const scoreBar = healthCard.querySelector('.health-score-bar');
        const scoreValue = healthCard.querySelector('.health-score-value');
        const insightsList = healthCard.querySelector('.health-insights');
        const lastCheckup = healthCard.querySelector('.last-checkup');
        const nextCheckup = healthCard.querySelector('.next-checkup');
        const aiBadge = healthCard.querySelector('.ai-badge-small');
        
        // Add loading state to the card
        healthCard.classList.add('loading');
        statusBadge.textContent = 'Analyzing...';
        statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800';
        
        // Try to use Databricks AI
        let summary;
        try {
            if (window.databricksAI && typeof window.databricksAI.generateQuickHealthSummary === 'function') {
                console.log("Generating AI-enhanced health summary for dashboard card...");
                summary = await window.databricksAI.generateQuickHealthSummary(data);
            } else {
                throw new Error("Databricks AI not available for quick summary");
            }
        } catch (error) {
            console.warn("Falling back to basic health summary:", error);
            // Create a basic summary without AI (using the same format from the databricks-ai.js fallback)
            let totalMetrics = 0;
            let abnormalMetrics = 0;
            let categories = new Set();
            
            for (const category in data) {
                categories.add(category);
                data[category].forEach(metric => {
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
            
            summary = {
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
        }
        
        // Update the card with summary data
        healthCard.classList.remove('loading');
        
        // Update status
        statusBadge.textContent = summary.status;
        switch (summary.status) {
            case 'Good':
                statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 health-card-status';
                break;
            case 'Caution':
                statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 health-card-status';
                break;
            case 'Warning':
                statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 health-card-status';
                break;
            default:
                statusBadge.className = 'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 health-card-status';
        }
        
        // Update score
        scoreBar.style.width = `${summary.score}%`;
        scoreValue.textContent = `${summary.score}%`;
        
        // Update color of the score bar based on score
        if (summary.score >= 70) {
            scoreBar.className = 'bg-blue-600 h-2.5 rounded-full health-score-bar';
        } else if (summary.score >= 50) {
            scoreBar.className = 'bg-yellow-500 h-2.5 rounded-full health-score-bar';
        } else {
            scoreBar.className = 'bg-red-500 h-2.5 rounded-full health-score-bar';
        }
        
        // Update insights
        insightsList.innerHTML = '';
        summary.insights.forEach(insight => {
            const li = document.createElement('li');
            li.className = 'text-sm text-gray-600';
            li.textContent = insight;
            insightsList.appendChild(li);
        });
        
        // Update checkup dates
        if (lastCheckup) lastCheckup.textContent = summary.lastCheckup;
        if (nextCheckup) nextCheckup.textContent = summary.nextCheckup;
        
        // Update AI badge visibility
        if (summary.isAI && aiBadge) {
            aiBadge.classList.remove('hidden');
        } else if (aiBadge) {
            aiBadge.classList.add('hidden');
        }
        
    } catch (error) {
        console.error("Failed to update health summary card:", error);
    }
}

// Helper function for date formatting
function formatDate(date) {
    if (!(date instanceof Date)) return "Unknown";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function setupExportFunctionality() {
    document.getElementById('exportSummaryBtn').addEventListener('click', () => {
        const summaryContent = document.getElementById('summaryText').innerText;
        const blob = new Blob([summaryContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'health-analysis-summary.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function initializeSampleUserData() {
    // Default to Shoaib Alam to match the CSV data
    const defaultName = 'Shoaib Alam';
    document.getElementById('fullName').value = defaultName;
    document.getElementById('dob').value = '1985-06-15';
    document.getElementById('gender').value = 'male';
    document.getElementById('bloodType').value = 'A+';
    document.getElementById('height').value = '175';
    document.getElementById('weight').value = '72';
    document.getElementById('allergies').value = 'None';
    document.getElementById('emergencyName').value = 'Family Contact';
    document.getElementById('emergencyPhone').value = '555-123-4567';
    document.getElementById('userName').textContent = defaultName.split(' ')[0];
    
    // Check if we have sample data to generate a health summary
    if (groupedData && Object.keys(groupedData).length > 0) {
        // Update health summary with existing data
        updateHealthSummaryCard(groupedData);
    } else {
        // Check if we need to load sample CSV data
        fetch('data/HealthReport.csv')
            .then(response => {
                if (response.ok) return response.text();
                throw new Error('No sample data available');
            })
            .then(data => {
                // Process sample data
                processCSV(data);
            })
            .catch(error => {
                console.log('No sample health data found:', error);
            });
    }
}

// Function to load Shoaib's health data
function loadShoaibHealthData() {
    fetch('data/shoaib_health_report.csv')
        .then(response => {
            if (response.ok) return response.text();
            throw new Error('Could not load Shoaib\'s health data');
        })
        .then(data => {
            // Process Shoaib's health data
            processCSV(data);
            console.log('Loaded Shoaib\'s health data');
        })
        .catch(error => {
            console.error('Error loading Shoaib\'s health data:', error);
        });
}

// Handle Quick Action buttons
function setupQuickActionButtons() {
    const nutritionBtn = document.getElementById('nutritionBtn');
    const medicationsBtn = document.getElementById('medicationsBtn');
    const activityBtn = document.getElementById('activityBtn');
    const newReportBtn = document.getElementById('newReportBtn');
    
    // Modal elements
    const aiSuggestionModal = document.getElementById('aiSuggestionModal');
    const closeSuggestionBtn = document.getElementById('closeSuggestionBtn');
    const suggestionTitle = document.getElementById('suggestionTitle');
    const suggestionDescription = document.getElementById('suggestionDescription');
    const suggestionsList = document.getElementById('suggestionsList');
    const suggestionLoading = document.getElementById('suggestionLoading');
    const suggestionContent = document.getElementById('suggestionContent');
    const saveSuggestionBtn = document.getElementById('saveSuggestionBtn');
    
    // Add click event listeners for each button
    if (nutritionBtn) {
        nutritionBtn.addEventListener('click', () => handleQuickAction('nutrition'));
    }
    
    if (medicationsBtn) {
        medicationsBtn.addEventListener('click', () => handleQuickAction('medications'));
    }
    
    if (activityBtn) {
        activityBtn.addEventListener('click', () => handleQuickAction('activity'));
    }
    
    if (newReportBtn) {
        newReportBtn.addEventListener('click', () => {
            document.getElementById('addRecordModal').classList.remove('hidden');
        });
    }
    
    // Close button for suggestion modal
    if (closeSuggestionBtn) {
        closeSuggestionBtn.addEventListener('click', () => {
            aiSuggestionModal.classList.add('hidden');
        });
    }
    
    // Save button click handler
    if (saveSuggestionBtn) {
        saveSuggestionBtn.addEventListener('click', () => {
            // In a real application, this would save the suggestions to the user's plan
            saveSuggestionBtn.textContent = 'Saved!';
            saveSuggestionBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            saveSuggestionBtn.classList.add('bg-green-600');
            
            setTimeout(() => {
                aiSuggestionModal.classList.add('hidden');
                saveSuggestionBtn.textContent = 'Save to My Plan';
                saveSuggestionBtn.classList.remove('bg-green-600');
                saveSuggestionBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }, 1500);
        });
    }
    
    // Handler for quick action button clicks
    async function handleQuickAction(actionType) {
        if (!groupedData || Object.keys(groupedData).length === 0) {
            alert('Please upload health data first to get personalized suggestions.');
            return;
        }
        
        // Show the modal and loading state
        aiSuggestionModal.classList.remove('hidden');
        suggestionLoading.classList.remove('hidden');
        suggestionContent.classList.add('hidden');
        
        // Set initial title
        switch (actionType) {
            case 'nutrition':
                suggestionTitle.textContent = 'Nutrition Suggestions';
                break;
            case 'medications':
                suggestionTitle.textContent = 'Medication Considerations';
                break;
            case 'activity':
                suggestionTitle.textContent = 'Activity Recommendations';
                break;
            default:
                suggestionTitle.textContent = 'Health Suggestions';
        }
        
        try {
            let suggestions;
            
            // Call the appropriate AI function based on action type
            if (window.databricksAI) {
                switch (actionType) {
                    case 'nutrition':
                        suggestions = await window.databricksAI.generateNutritionSuggestions(groupedData);
                        break;
                    case 'medications':
                        suggestions = await window.databricksAI.generateMedicationSuggestions(groupedData);
                        break;
                    case 'activity':
                        suggestions = await window.databricksAI.generateActivitySuggestions(groupedData);
                        break;
                    default:
                        throw new Error('Unknown action type');
                }
            } else {
                throw new Error('Databricks AI not available');
            }
            
            // Update the modal content with suggestions
            suggestionTitle.textContent = suggestions.title;
            suggestionDescription.textContent = suggestions.description;
            
            // Clear previous suggestions
            suggestionsList.innerHTML = '';
            
            // Add new suggestions
            suggestions.suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.className = 'text-gray-700';
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
            
            // Show content, hide loading
            suggestionLoading.classList.add('hidden');
            suggestionContent.classList.remove('hidden');
            
        } catch (error) {
            console.error(`Error generating ${actionType} suggestions:`, error);
            
            // Show error message
            suggestionTitle.textContent = 'Could Not Generate Suggestions';
            suggestionDescription.textContent = 'Sorry, we couldn\'t generate personalized suggestions at this time. Please try again later.';
            suggestionsList.innerHTML = '';
            
            // Show content, hide loading
            suggestionLoading.classList.add('hidden');
            suggestionContent.classList.remove('hidden');
        }
    }
}

// Add event listeners for expand/collapse all buttons
function setupSectionControls() {
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', expandAllSections);
    }
    
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', collapseAllSections);
    }
}

// Function to expand all sections
function expandAllSections() {
    const sections = document.querySelectorAll('#metricsContainer > div');
    const states = JSON.parse(localStorage.getItem('healthTrackerSectionStates') || '{}');
    
    sections.forEach(section => {
        section.classList.remove('collapsed');
        const title = section.querySelector('.collapsible-header h3').textContent;
        delete states[title];
    });
    
    localStorage.setItem('healthTrackerSectionStates', JSON.stringify(states));
}

// Function to collapse all sections
function collapseAllSections() {
    const sections = document.querySelectorAll('#metricsContainer > div');
    const states = JSON.parse(localStorage.getItem('healthTrackerSectionStates') || '{}');
    
    sections.forEach(section => {
        section.classList.add('collapsed');
        const title = section.querySelector('.collapsible-header h3').textContent;
        states[title] = 'collapsed';
    });
    
    localStorage.setItem('healthTrackerSectionStates', JSON.stringify(states));
}

// Function to initialize collapsible sections
function initializeCollapsibleSections() {
    const sectionStates = JSON.parse(localStorage.getItem('healthTrackerSectionStates') || '{}');
    
    document.querySelectorAll('#metricsContainer > div').forEach(section => {
        const header = section.querySelector('.collapsible-header');
        const title = header.querySelector('h3').textContent;
        
        // Restore state from localStorage if available
        if (sectionStates[title] === 'collapsed') {
            section.classList.add('collapsed');
        }
        
        // Add click handler to save state
        header.addEventListener('click', () => {
            const isCollapsed = section.classList.contains('collapsed');
            const states = JSON.parse(localStorage.getItem('healthTrackerSectionStates') || '{}');
            
            // Update state
            if (isCollapsed) {
                delete states[title];
            } else {
                states[title] = 'collapsed';
            }
            
            localStorage.setItem('healthTrackerSectionStates', JSON.stringify(states));
        });
    });
}

// No need for separate initialization as it's handled in main DOMContentLoaded event
