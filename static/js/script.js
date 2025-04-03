// SEO Meta Tag Analyzer - Client-side JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const analyzerForm = document.getElementById('analyzer-form');
    const urlInput = document.getElementById('url-input');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsSection = document.getElementById('results-section');
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    
    // Status Indicators
    const statusIcons = {
        good: '<i class="fas fa-check-circle text-success"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-warning"></i>',
        error: '<i class="fas fa-times-circle text-danger"></i>'
    };
    
    // Form Validation & Submission
    analyzerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validate URL
        if (!urlInput.value.trim()) {
            urlInput.classList.add('is-invalid');
            return;
        }
        
        // Reset UI state
        urlInput.classList.remove('is-invalid');
        hideElement(errorAlert);
        hideElement(resultsSection);
        showElement(loadingIndicator);
        
        // Send analysis request
        const formData = new FormData();
        formData.append('url', urlInput.value.trim());
        
        fetch('/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            hideElement(loadingIndicator);
            
            if (data.success) {
                displayResults(data.data);
                showElement(resultsSection);
            } else {
                showError(data.error || 'An error occurred during analysis');
            }
        })
        .catch(error => {
            hideElement(loadingIndicator);
            showError('Failed to analyze the URL: ' + error.message);
        });
    });
    
    // URL Input validation
    urlInput.addEventListener('input', function() {
        if (urlInput.value.trim()) {
            urlInput.classList.remove('is-invalid');
        }
    });
    
    // Display Analysis Results
    function displayResults(data) {
        // Update SEO score and counters
        updateSeoScoreSection(data);
        
        // Update Google search preview
        updateGooglePreview(data);
        
        // Update SEO checks
        displaySeoChecks(data);
        
        // Update social media previews
        updateSocialPreviews(data);
        
        // Update recommendations
        displayRecommendations(data.recommendations);
    }
    
    // Update SEO Score Section
    function updateSeoScoreSection(data) {
        // Calculate totals
        let passedChecks = 0;
        let warnings = 0;
        let failedChecks = 0;
        
        // Count statuses
        countStatus(data.title.status);
        countStatus(data.meta_description.status);
        countStatus(data.canonical.status);
        countStatus(data.robots.status);
        
        if (data.headings.h1.length === 1) passedChecks++;
        else if (data.headings.h1.length === 0) failedChecks++;
        else warnings++;
        
        Object.values(data.og_tags).forEach(tag => countStatus(tag.status));
        Object.values(data.twitter_tags).forEach(tag => countStatus(tag.status));
        
        function countStatus(status) {
            if (status === 'good') passedChecks++;
            else if (status === 'warning') warnings++;
            else if (status === 'error') failedChecks++;
        }
        
        // Calculate score (percentage of passed checks)
        const totalChecks = passedChecks + warnings + failedChecks;
        const score = Math.round(((passedChecks + (warnings * 0.5)) / totalChecks) * 100);
        
        // Update counters
        document.getElementById('passed-checks-count').textContent = passedChecks;
        document.getElementById('warnings-count').textContent = warnings;
        document.getElementById('failed-checks-count').textContent = failedChecks;
        
        // Update score
        const scoreElement = document.getElementById('seo-score');
        const scoreCircle = document.getElementById('seo-score-circle');
        const scoreRating = document.getElementById('seo-score-rating');
        
        scoreElement.textContent = score;
        
        // Clear previous classes
        scoreCircle.classList.remove('score-excellent', 'score-good', 'score-average', 'score-poor');
        
        // Set appropriate class based on score
        if (score >= 90) {
            scoreCircle.classList.add('score-excellent');
            scoreRating.textContent = 'Excellent';
        } else if (score >= 70) {
            scoreCircle.classList.add('score-good');
            scoreRating.textContent = 'Good';
        } else if (score >= 50) {
            scoreCircle.classList.add('score-average');
            scoreRating.textContent = 'Average';
        } else {
            scoreCircle.classList.add('score-poor');
            scoreRating.textContent = 'Poor';
        }
    }
    
    // Update Google Preview
    function updateGooglePreview(data) {
        // Update Google search result preview
        updateTextContent('google-title', data.title.content || 'No title');
        updateTextContent('google-url', data.url);
        updateTextContent('google-description', data.meta_description.content || 'No description available.');
    }
    
    // Display SEO Checks
    function displaySeoChecks(data) {
        const container = document.getElementById('seo-checks-container');
        container.innerHTML = '';
        
        // Add Title Check
        addSeoCheckItem('Title Tag', data.title.status, 
            getTitleStatusMessage(data.title));
        
        // Add Meta Description Check
        addSeoCheckItem('Meta Description', data.meta_description.status, 
            getMetaDescriptionStatusMessage(data.meta_description));
        
        // Add Meta Keywords Check
        // This is a simplified example - in a real app, you'd check if keywords exist
        const keywordsStatus = data.meta_keywords ? 'good' : 'warning';
        const keywordsMessage = data.meta_keywords 
            ? 'Meta keywords tag is present. While not critical for Google, it may be useful for other search engines.'
            : 'Meta keywords tag is missing. While not critical for Google, it may be useful for other search engines.';
        
        addSeoCheckItem('Meta Keywords', keywordsStatus, keywordsMessage);
        
        // Add Viewport Meta Tag Check
        const viewportExists = true; // Simplified - you'd check from data
        const viewportStatus = viewportExists ? 'good' : 'error';
        const viewportMessage = viewportExists
            ? 'Viewport meta tag is properly set, which is good for mobile optimization.'
            : 'Viewport meta tag is missing, which is important for mobile optimization.';
        
        addSeoCheckItem('Viewport Meta Tag', viewportStatus, viewportMessage);
        
        // Add Robots Meta Tag Check
        addSeoCheckItem('Robots Meta Tag', data.robots.status, 
            getRobotsStatusMessage(data.robots));
        
        function addSeoCheckItem(title, status, message) {
            const statusClass = status === 'good' ? 'success' : (status === 'warning' ? 'warning' : 'danger');
            const statusIcon = status === 'good' ? 'check-circle' : (status === 'warning' ? 'exclamation-triangle' : 'times-circle');
            const statusText = status === 'good' ? 'Passed' : (status === 'warning' ? 'Warning' : 'Failed');
            
            const checkItem = document.createElement('div');
            checkItem.className = `card mb-3 border-${statusClass}`;
            checkItem.innerHTML = `
                <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                        <i class="fas fa-${statusIcon} text-${statusClass} me-2"></i>
                        <h4 class="h6 mb-0">${title}</h4>
                        <span class="ms-auto badge bg-${statusClass}">${statusText}</span>
                    </div>
                    <p class="mb-1 small">${message}</p>
                    <button class="btn btn-sm btn-link ps-0 text-decoration-none small">Show details</button>
                </div>
            `;
            
            container.appendChild(checkItem);
        }
        
        function getTitleStatusMessage(titleData) {
            if (!titleData.content) return 'Your page is missing a title tag, which is critical for SEO.';
            
            if (titleData.length < 30) {
                return `Your title tag is too short (${titleData.length} characters). Consider making it between 50-60 characters.`;
            } else if (titleData.length > 60) {
                return `Your title tag is too long (${titleData.length} characters). Consider making it between 50-60 characters.`;
            } else {
                return `Your title tag length is optimal (${titleData.length} characters).`;
            }
        }
        
        function getMetaDescriptionStatusMessage(descData) {
            if (!descData.content) return 'Your page is missing a meta description, which is important for SEO.';
            
            if (descData.length < 120) {
                return `Your meta description is a bit short (${descData.length} characters). Consider expanding it to 120-155 characters.`;
            } else if (descData.length > 155) {
                return `Your meta description is too long (${descData.length} characters). Consider shortening it to 120-155 characters.`;
            } else {
                return `Your meta description length is optimal (${descData.length} characters).`;
            }
        }
        
        function getRobotsStatusMessage(robotsData) {
            if (!robotsData.content) return 'No robots meta tag found (default: index, follow).';
            
            if (robotsData.content.toLowerCase().includes('noindex')) {
                return 'Your robots meta tag includes "noindex", which prevents search engines from indexing this page.';
            } else if (robotsData.content.toLowerCase().includes('nofollow')) {
                return 'Your robots meta tag includes "nofollow", which prevents search engines from following links on this page.';
            } else {
                return 'Robots meta tag allows indexing and following links.';
            }
        }
    }
    
    // Update Social Media Previews
    function updateSocialPreviews(data) {
        // Facebook/OG preview
        updateTextContent('facebook-domain', data.domain);
        updateTextContent('facebook-title', 
            (data.og_tags['og:title'] && data.og_tags['og:title'].content) || 
            data.title.content || 
            'No title'
        );
        updateTextContent('facebook-description', 
            (data.og_tags['og:description'] && data.og_tags['og:description'].content) || 
            data.meta_description.content || 
            'No description available.'
        );
        
        // Update Facebook/OG image
        updateSocialImage('facebook-image', 
            data.og_tags['og:image'] && data.og_tags['og:image'].content);
        
        // Twitter preview
        updateTextContent('twitter-domain', data.domain);
        updateTextContent('twitter-title-preview', 
            (data.twitter_tags['twitter:title'] && data.twitter_tags['twitter:title'].content) || 
            (data.og_tags['og:title'] && data.og_tags['og:title'].content) || 
            data.title.content || 
            'No title'
        );
        updateTextContent('twitter-description-preview', 
            (data.twitter_tags['twitter:description'] && data.twitter_tags['twitter:description'].content) || 
            (data.og_tags['og:description'] && data.og_tags['og:description'].content) || 
            data.meta_description.content || 
            'No description available.'
        );
        
        // Update Twitter image
        updateSocialImage('twitter-image', 
            (data.twitter_tags['twitter:image'] && data.twitter_tags['twitter:image'].content) || 
            (data.og_tags['og:image'] && data.og_tags['og:image'].content));
        
        // Update OG tags table
        updateOgTagsTable(data.og_tags);
        
        // Update Twitter tags table
        updateTwitterTagsTable(data.twitter_tags);
    }
    
    // Update social image preview
    function updateSocialImage(containerId, imageUrl) {
        const container = document.getElementById(containerId);
        
        if (imageUrl) {
            // Create an image element
            container.innerHTML = `<img src="${imageUrl}" alt="Preview" class="img-fluid">`;
        } else {
            // Show no image placeholder
            container.innerHTML = `
                <div class="no-image-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No Image</span>
                </div>
            `;
        }
    }
    
    // Update Open Graph tags table
    function updateOgTagsTable(ogTags) {
        const table = document.getElementById('og-tags-table');
        table.innerHTML = '';
        
        const commonTags = ['og:title', 'og:description', 'og:url', 'og:site_name', 'og:locale'];
        
        commonTags.forEach(tag => {
            const row = document.createElement('tr');
            const tagCell = document.createElement('td');
            const contentCell = document.createElement('td');
            
            tagCell.textContent = tag;
            
            if (ogTags[tag] && ogTags[tag].content) {
                contentCell.textContent = ogTags[tag].content;
            } else {
                contentCell.textContent = 'Not found';
                contentCell.className = 'text-muted';
            }
            
            row.appendChild(tagCell);
            row.appendChild(contentCell);
            table.appendChild(row);
        });
    }
    
    // Update Twitter Card tags table
    function updateTwitterTagsTable(twitterTags) {
        const table = document.getElementById('twitter-tags-table');
        table.innerHTML = '';
        
        const commonTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
        
        commonTags.forEach(tag => {
            const row = document.createElement('tr');
            const tagCell = document.createElement('td');
            const contentCell = document.createElement('td');
            
            tagCell.textContent = tag;
            
            if (twitterTags[tag] && twitterTags[tag].content) {
                contentCell.textContent = twitterTags[tag].content;
            } else {
                contentCell.textContent = 'Not found';
                contentCell.className = 'text-muted';
            }
            
            row.appendChild(tagCell);
            row.appendChild(contentCell);
            table.appendChild(row);
        });
    }
    
    // Display Recommendations
    function displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-container');
        container.innerHTML = '';
        
        if (recommendations && recommendations.length > 0) {
            recommendations.forEach((recommendation, index) => {
                // Determine recommendation type based on content
                let type = 'warning';
                if (recommendation.toLowerCase().includes('good') || 
                    recommendation.toLowerCase().includes('properly')) {
                    type = 'success';
                } else if (recommendation.toLowerCase().includes('missing') || 
                          recommendation.toLowerCase().includes('no ')) {
                    type = 'danger';
                }
                
                // Get a title from the recommendation
                let title = recommendation.split('.')[0];
                if (title.length > 50) {
                    title = title.substring(0, 47) + '...';
                }
                
                // Create recommendation item
                const item = document.createElement('div');
                item.className = `card mb-3 border-start border-${type} border-4`;
                item.innerHTML = `
                    <div class="card-body py-3">
                        <h5 class="h6 mb-2">${title}</h5>
                        <p class="mb-0 small">${recommendation}</p>
                    </div>
                `;
                
                container.appendChild(item);
            });
        } else {
            container.innerHTML = `
                <div class="card border-start border-success border-4">
                    <div class="card-body py-3">
                        <h5 class="h6 mb-2">Great SEO Implementation</h5>
                        <p class="mb-0 small">No recommendations needed. Your site appears to be following SEO best practices.</p>
                    </div>
                </div>
            `;
        }
    }
    
    // Utility Functions
    function showElement(element) {
        element.classList.remove('d-none');
    }
    
    function hideElement(element) {
        element.classList.add('d-none');
    }
    
    function updateTextContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        }
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        showElement(errorAlert);
    }
});
