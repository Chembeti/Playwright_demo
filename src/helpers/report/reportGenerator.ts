import * as fs from 'fs-extra'; 
import * as path from 'path';

interface Feature {
    name: string;
    path: string;
    scenarios: Scenario[];
}

interface Scenario {
    name: string;
    duration: number;
    status: string;
    retries: number;
    failedStep?: string;
}

class ReportGenerator {
    
    private passedFeatures: Feature[];
    private failedFeatures: Feature[];
    private totalDuration: number;
    private totalRetries: number;

    constructor() {
        const testResultsDir = path.join(__dirname, '../../../test-results');
        const passedPath = path.join(testResultsDir, 'passed-scenarios.json');
        
        // Handle missing passed-scenarios.json
        this.passedFeatures = fs.existsSync(passedPath) 
            ? fs.readJsonSync(passedPath) 
            : [];
            
        this.failedFeatures = this.loadFailedFeatures(testResultsDir);
        this.totalDuration = this.calculateTotalDuration();
        this.totalRetries = this.calculateTotalRetries();
    }
    
    private calculateTotalRetries(): number {
        return [...this.passedFeatures, ...this.failedFeatures]
            .flatMap(f => f.scenarios)
            .reduce((sum, s) => sum + s.retries, 0);
    }

    private calculateTotalDuration(): number {
        const allScenarios = [...this.passedFeatures, ...this.failedFeatures]
            .flatMap(f => f.scenarios);
        return allScenarios.reduce((sum, s) => sum + s.duration, 0);
    }

    private loadFailedFeatures(testResultsDir: string): Feature[] {
        const failedDir = path.join(testResultsDir, 'failed');
        if (!fs.existsSync(failedDir)) return [];
        
        return fs.readdirSync(failedDir)
            .filter(file => file.endsWith('-failed-scenarios.json'))
            .map(file => fs.readJsonSync(path.join(failedDir, file)));
    }

    private mergeFeatures(): Feature[] {
        const featureMap: Record<string, Feature> = {};

        // Process passed features
        this.passedFeatures.forEach(feature => {
            if (!featureMap[feature.path]) {
                featureMap[feature.path] = { ...feature, scenarios: [] };
            }
            featureMap[feature.path].scenarios.push(...feature.scenarios.map(s => ({ ...s, status: 'passed' })));
        });

        // Process failed features
        this.failedFeatures.forEach(feature => {
            if (!featureMap[feature.path]) {
                featureMap[feature.path] = { ...feature, scenarios: [] };
            }
            featureMap[feature.path].scenarios.push(...feature.scenarios.map(s => ({ ...s, status: 'failed' })));
        });

        return Object.values(featureMap);
    }

    public generateHtmlReport(): void {
        const allFeatures = this.mergeFeatures();
        const html = this.generateHtml(allFeatures);
        const outputPath = path.join(__dirname, '../../../test-results/report.html');
        fs.ensureDirSync(path.dirname(outputPath));
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`Report generated: ${outputPath}`);
    }

    private generateHtml(features: Feature[]): string {
        const uniqueScenarios = features.flatMap(f => f.scenarios);
        const totalUnique = uniqueScenarios.length;
        const failedUnique = uniqueScenarios.filter(s => s.status === 'failed').length;
        const retriedScenarios = uniqueScenarios.filter(s => s.retries > 0).length;

        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Sample UI Automation Test Report</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            :root {
                --primary-color: #0077b6;
                --secondary-color: #0096c7;
                --background-color: #f8f9fa;
                --text-color: #343a40;
                --success-color: #28a745;
                --warning-color: #ffc107;
                --danger-color: #dc3545;
                --light-gray: #e9ecef;
                --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                --border-radius: 8px;
            }
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: var(--text-color);
                background-color: #f0f2f5;
                line-height: 1.6;
                padding: 0;
                margin: 0;			
			    background-size: cover;
			    background-repeat: no-repeat;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            header {
                background-color: var(--primary-color);
                color: white;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            h1 {
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 0;
            }
            
            .dashboard {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .card {
                background: white;
                border-radius: var(--border-radius);
                padding: 20px;
                box-shadow: var(--card-shadow);
                transition: transform 0.2s ease;
            }
            
            .card:hover {
                transform: translateY(-3px);
            }
            
            .card-title {
                font-size: 16px;
                color: #6c757d;
                margin-bottom: 10px;
            }
            
            .card-value {
                font-size: 32px;
                font-weight: 600;
                color: var(--primary-color);
            }
            
            .controls {
                background: white;
                padding: 20px;
                border-radius: var(--border-radius);
                margin-bottom: 20px;
                box-shadow: var(--card-shadow);
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: space-between;
                align-items: center;
            }
            
            .filter-group {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .radio-label {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 4px;
                background-color: var(--light-gray);
                transition: all 0.2s ease;
            }
            
            .radio-label:hover {
                background-color: #dde2e6;
            }
            
            input[type="radio"] {
                margin-right: 5px;
            }
            
            input[type="radio"]:checked + .radio-label {
                background-color: var(--primary-color);
                color: white;
            }
            
            .search-container {
                position: relative;
                flex-grow: 1;
                max-width: 400px;
            }
            
            .search-container input {
                width: 100%;
                padding: 10px 15px 10px 35px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .search-icon {
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #6c757d;
            }
            
            .feature {
                background: white;
                border-radius: var(--border-radius);
                margin-bottom: 15px;
                overflow: hidden;
                box-shadow: var(--card-shadow);
            }
            
            .feature-header {
                padding: 15px 20px;
                background-color: var(--secondary-color);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                transition: background-color 0.2s ease;
            }
            
            .feature-header:hover {
                background-color: var(--primary-color);
            }
            
            .feature-content {
                padding: 0 20px;
            }
            
            .feature-path {
                padding: 15px 0;
                color: #6c757d;
                font-size: 14px;
                border-bottom: 1px solid var(--light-gray);
            }
            
            .scenario {
                margin: 15px 0;
                border-radius: var(--border-radius);
                overflow: hidden;
            }
            
            .scenario.passed {
                border-left: 4px solid var(--success-color);
            }
            
            .scenario.failed {
                border-left: 4px solid var(--danger-color);
            }
            
            .scenario-header {
                padding: 12px 15px;
                background-color: #f8f9fa;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .scenario-title {
                flex-grow: 1;
                font-weight: 500;
                font-size: 16px;
            }
            
            .scenario-meta {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .status-passed {
                background-color: #e6ffec;
                color: var(--success-color);
            }
            
            .status-failed {
                background-color: #ffebe9;
                color: var(--danger-color);
            }
            
            .retry-badge {
                background-color: #fff8e6;
                color: var(--warning-color);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .scenario-content {
                padding: 12px 15px;
                background-color: #fbfbfb;
            }
            
            .error {
                background-color: #ffebe9;
                padding: 10px 15px;
                border-radius: 4px;
                color: var(--danger-color);
                font-size: 14px;
                margin-top: 10px;
            }
            
            .caret {
                margin-right: 10px;
                transition: transform 0.3s ease;
            }
            
            .hidden {
                display: none !important;
            }
            
            .no-results {
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }
            
            @media (max-width: 768px) {
                .dashboard {
                    grid-template-columns: 1fr;
                }
                
                .controls {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .search-container {
                    max-width: 100%;
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <header>
            <div class="container">
                <h1>Sample UI Automation Test Report</h1>
            </div>
        </header>
        
        <div class="container">
            <div class="dashboard">
                <div class="card">
                    <div class="card-title">Total Scenarios</div>
                    <div class="card-value">${totalUnique}</div>
                </div>
                <div class="card">
                    <div class="card-title">Failed Scenarios</div>
                    <div class="card-value">${failedUnique}</div>
                </div>
                <div class="card">
                    <div class="card-title">Retried Scenarios</div>
                    <div class="card-value">${retriedScenarios}</div>
                </div>
                <div class="card">
                    <div class="card-title">Total Retries</div>
                    <div class="card-value">${this.totalRetries}</div>
                </div>
            </div>
            
            <div class="controls">
                <div class="filter-group">
                    <label class="radio-option">
                        <input type="radio" name="filter" id="showAll" value="all" checked>
                        <span class="radio-label">Show all tests</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="filter" id="showFailed" value="failed">
                        <span class="radio-label">Show only failed tests</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="filter" id="showRetried" value="retried">
                        <span class="radio-label">Show failed and retried tests</span>
                    </label>
                </div>
                
                <div class="search-container">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="searchTests" placeholder="Search scenarios...">
                </div>
            </div>
            
            <div id="featuresContainer">
                ${features.map(f => `
                <div class="feature" data-feature>
                    <div class="feature-header" data-toggle>
                        <span class="caret">▼</span>
                        <div class="feature-title">Feature: ${f.name}</div>
                    </div>
                    <div class="feature-content">
                        <div class="feature-path">Path: ${f.path}</div>
                        ${f.scenarios.map(s => `
                        <div class="scenario ${s.status}" data-scenario data-retries="${s.retries}" data-name="${s.name.toLowerCase()}" data-status="${s.status}">
                            <div class="scenario-header" data-toggle>
                                <span class="caret">▼</span>
                                <div class="scenario-title">Scenario: ${s.name}</div>
                                <div class="scenario-meta">
                                    ${s.retries > 0 ? `<span class="retry-badge">${s.retries} ${s.retries === 1 ? 'retry' : 'retries'}</span>` : ''}
                                    <span class="status-badge status-${s.status}">${s.status.toUpperCase()}</span>
                                </div>
                            </div>
                            <div class="scenario-content">
                                ${s.status === 'failed' ? `<div class="error"><i class="fas fa-exclamation-circle"></i> <strong>Failed Step:</strong> ${s.failedStep}</div>` : ''}
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>`).join('')}
            </div>
            
            <div class="no-results hidden" id="noResults">
                <i class="fas fa-search" style="font-size: 48px; opacity: 0.5; margin-bottom: 20px;"></i>
                <h3>No matching scenarios found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        </div>
    
        <script>
            // Toggle feature and scenario content
            document.body.addEventListener('click', e => {
                const toggleElement = e.target.closest('[data-toggle]');
                if (toggleElement) {
                    const parent = toggleElement.parentElement;
                    const content = parent.querySelector('.feature-content, .scenario-content');
                    content.classList.toggle('hidden');
                    const caret = toggleElement.querySelector('.caret');
                    if (caret) {
                        caret.style.transform = content.classList.contains('hidden') ? 'rotate(-90deg)' : '';
                    }
                }
            });
    
            // Filter functions
            const applyFilters = () => {
                const searchText = document.getElementById('searchTests').value.toLowerCase();
                const filterValue = document.querySelector('input[name="filter"]:checked').value;
                
                let visibleScenarios = 0;
                const allScenarios = document.querySelectorAll('[data-scenario]');
                
                allScenarios.forEach(scenario => {
                    const name = scenario.dataset.name;
                    const status = scenario.dataset.status;
                    const retries = parseInt(scenario.dataset.retries || '0');
                    
                    // Apply filter conditions
                    let showByFilter = true;
                    if (filterValue === 'failed') {
                        showByFilter = status === 'failed';
                    } else if (filterValue === 'retried') {
                        showByFilter = status === 'failed' || retries > 0;
                    }
                    
                    // Apply search condition
                    const matchesSearch = name.includes(searchText);
                    
                    // Combine conditions
                    const isVisible = showByFilter && matchesSearch;
                    
                    scenario.classList.toggle('hidden', !isVisible);
                    if (isVisible) visibleScenarios++;
                });
                
                // Show/hide features based on whether they have visible scenarios
                document.querySelectorAll('[data-feature]').forEach(feature => {
                    const hasVisibleScenarios = Array.from(feature.querySelectorAll('[data-scenario]'))
                        .some(s => !s.classList.contains('hidden'));
                    feature.classList.toggle('hidden', !hasVisibleScenarios);
                });
                
                // Show/hide "No results" message
                document.getElementById('noResults').classList.toggle('hidden', visibleScenarios > 0);
            };
            
            // Add event listeners
            document.querySelectorAll('input[name="filter"]').forEach(radio => {
                radio.addEventListener('change', applyFilters);
            });
            
            document.getElementById('searchTests').addEventListener('input', applyFilters);
            
            // Initialize with all items expanded
            document.addEventListener('DOMContentLoaded', () => {
                // Set initial state (everything visible)
                applyFilters();
            });
        </script>
    </body>
    </html>`;
    }
    
}

// Generate the report
new ReportGenerator().generateHtmlReport();
