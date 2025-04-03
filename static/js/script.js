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
        // Display basic SEO tags
        displayBasicSeoTags(data);
        
        // Display heading structure
        displayHeadings(data.headings);
        
        // Display Open Graph tags
        displayOgTags(data.og_tags);
        
        // Display Twitter Card tags
        displayTwitterTags(data.twitter_tags);
        
        // Display recommendations
        displayRecommendations(data.recommendations);
        
        // Update previews
        updatePreviews(data);
        
        // Calculate and display SEO score
        calculateSeoScore(data);
    }
    
    // Display Basic SEO Tags
    function displayBasicSeoTags(data) {
        // Title
        updateStatusElement('title-status', data.title.status);
        updateTextContent('title-content', data.title.content || 'No title tag found');
        updateTextContent('title-length', data.title.content ? 
            `Length: ${data.title.length} characters` : '');
        
        // Meta Description
        updateStatusElement('description-status', data.meta_description.status);
        updateTextContent('description-content', data.meta_description.content || 'No meta description found');
        updateTextContent('description-length', data.meta_description.content ? 
            `Length: ${data.meta_description.length} characters` : '');
        
        // Canonical URL
        updateStatusElement('canonical-status', data.canonical.status);
        updateTextContent('canonical-content', data.canonical.content || 'No canonical URL found');
        
        // Robots
        updateStatusElement('robots-status', data.robots.status);
        updateTextContent('robots-content', data.robots.content || 'No robots meta tag found (default: index, follow)');
    }
    
    // Display Heading Structure
    function displayHeadings(headings) {
        // H1 Headings
        const h1Count = headings.h1.length;
        updateTextContent('h1-count', h1Count);
        
        const h1Container = document.getElementById('h1-tags');
        h1Container.innerHTML = '';
        
        if (h1Count > 0) {
            headings.h1.forEach(heading => {
                const headingElement = document.createElement('div');
                headingElement.className = 'heading-item';
                headingElement.textContent = heading;
                h1Container.appendChild(headingElement);
            });
        } else {
            h1Container.innerHTML = '<div class="text-muted">No H1 headings found</div>';
        }
        
        // H2 Headings
        const h2Count = headings.h2.length;
        updateTextContent('h2-count', h2Count);
        
        const h2Container = document.getElementById('h2-tags');
        h2Container.innerHTML = '';
        
        if (h2Count > 0) {
            headings.h2.forEach(heading => {
                const headingElement = document.createElement('div');
                headingElement.className = 'heading-item';
                headingElement.textContent = heading;
                h2Container.appendChild(headingElement);
            });
        } else {
            h2Container.innerHTML = '<div class="text-muted">No H2 headings found</div>';
        }
        
        // H3 Headings
        const h3Count = headings.h3.length;
        updateTextContent('h3-count', h3Count);
        
        const h3Container = document.getElementById('h3-tags');
        h3Container.innerHTML = '';
        
        if (h3Count > 0) {
            headings.h3.forEach(heading => {
                const headingElement = document.createElement('div');
                headingElement.className = 'heading-item';
                headingElement.textContent = heading;
                h3Container.appendChild(headingElement);
            });
        } else {
            h3Container.innerHTML = '<div class="text-muted">No H3 headings found</div>';
        }
    }
    
    // Display Open Graph Tags
    function displayOgTags(ogTags) {
        // og:title
        if (ogTags['og:title']) {
            updateStatusElement('og-title-status', ogTags['og:title'].status);
            updateTextContent('og-title-content', ogTags['og:title'].content || 'Not found');
        } else {
            updateStatusElement('og-title-status', 'error');
            updateTextContent('og-title-content', 'Not found');
        }
        
        // og:description
        if (ogTags['og:description']) {
            updateStatusElement('og-description-status', ogTags['og:description'].status);
            updateTextContent('og-description-content', ogTags['og:description'].content || 'Not found');
        } else {
            updateStatusElement('og-description-status', 'error');
            updateTextContent('og-description-content', 'Not found');
        }
        
        // og:image
        if (ogTags['og:image']) {
            updateStatusElement('og-image-status', ogTags['og:image'].status);
            updateTextContent('og-image-content', ogTags['og:image'].content || 'Not found');
        } else {
            updateStatusElement('og-image-status', 'error');
            updateTextContent('og-image-content', 'Not found');
        }
        
        // Other OG tags
        updateStatusElement('og-url-status', ogTags['og:url'] ? ogTags['og:url'].status : 'error');
        updateStatusElement('og-type-status', ogTags['og:type'] ? ogTags['og:type'].status : 'error');
        updateStatusElement('og-site-name-status', ogTags['og:site_name'] ? ogTags['og:site_name'].status : 'error');
    }
    
    // Display Twitter Card Tags
    function displayTwitterTags(twitterTags) {
        // twitter:card
        if (twitterTags['twitter:card']) {
            updateStatusElement('twitter-card-status', twitterTags['twitter:card'].status);
            updateTextContent('twitter-card-content', twitterTags['twitter:card'].content || 'Not found');
        } else {
            updateStatusElement('twitter-card-status', 'error');
            updateTextContent('twitter-card-content', 'Not found');
        }
        
        // twitter:title
        if (twitterTags['twitter:title']) {
            updateStatusElement('twitter-title-status', twitterTags['twitter:title'].status);
            updateTextContent('twitter-title-content', twitterTags['twitter:title'].content || 'Not found');
        } else {
            updateStatusElement('twitter-title-status', 'error');
            updateTextContent('twitter-title-content', 'Not found');
        }
        
        // twitter:description
        if (twitterTags['twitter:description']) {
            updateStatusElement('twitter-description-status', twitterTags['twitter:description'].status);
            updateTextContent('twitter-description-content', twitterTags['twitter:description'].content || 'Not found');
        } else {
            updateStatusElement('twitter-description-status', 'error');
            updateTextContent('twitter-description-content', 'Not found');
        }
        
        // twitter:image
        if (twitterTags['twitter:image']) {
            updateStatusElement('twitter-image-status', twitterTags['twitter:image'].status);
            updateTextContent('twitter-image-content', twitterTags['twitter:image'].content || 'Not found');
        } else {
            updateStatusElement('twitter-image-status', 'error');
            updateTextContent('twitter-image-content', 'Not found');
        }
    }
    
    // Display Recommendations
    function displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-list');
        container.innerHTML = '';
        
        if (recommendations && recommendations.length > 0) {
            const list = document.createElement('ul');
            list.className = 'list-group';
            
            recommendations.forEach(recommendation => {
                const item = document.createElement('li');
                item.className = 'list-group-item';
                item.innerHTML = `<i class="fas fa-lightbulb text-warning me-2"></i> ${recommendation}`;
                list.appendChild(item);
            });
            
            container.appendChild(list);
        } else {
            container.innerHTML = `
                <div class="text-center text-success py-4">
                    <i class="fas fa-check-circle fa-3x mb-3"></i>
                    <p>Great job! No recommendations needed.</p>
                </div>
            `;
        }
    }
    
    // Update Preview Sections
    function updatePreviews(data) {
        // Google search result preview
        updateTextContent('google-title', data.title.content || 'No title');
        updateTextContent('google-url', data.url);
        updateTextContent('google-description', data.meta_description.content || 'No description available.');
        
        // Facebook preview
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
        
        // Update Facebook image if available
        const facebookImageContainer = document.getElementById('facebook-image');
        if (data.og_tags['og:image'] && data.og_tags['og:image'].content) {
            facebookImageContainer.innerHTML = `
                <div class="image-placeholder" title="Image from: ${data.og_tags['og:image'].content}">
                    <i class="fas fa-image"></i>
                    <span>Image Available</span>
                </div>
            `;
        } else {
            facebookImageContainer.innerHTML = `
                <div class="no-image-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No Image</span>
                </div>
            `;
        }
        
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
        
        // Update Twitter image if available
        const twitterImageContainer = document.getElementById('twitter-image');
        if ((data.twitter_tags['twitter:image'] && data.twitter_tags['twitter:image'].content) || 
            (data.og_tags['og:image'] && data.og_tags['og:image'].content)) {
            twitterImageContainer.innerHTML = `
                <div class="image-placeholder" title="Image Available">
                    <i class="fas fa-image"></i>
                    <span>Image Available</span>
                </div>
            `;
        } else {
            twitterImageContainer.innerHTML = `
                <div class="no-image-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No Image</span>
                </div>
            `;
        }
    }
    
    // Calculate SEO Score
    function calculateSeoScore(data) {
        let totalPoints = 0;
        let earnedPoints = 0;
        
        // Basic SEO score (40% of total)
        let basicSeoPoints = 0;
        let basicSeoTotal = 4;
        
        // Title
        if (data.title.content) {
            if (data.title.status === 'good') basicSeoPoints += 1;
            else if (data.title.status === 'warning') basicSeoPoints += 0.5;
        }
        
        // Meta Description
        if (data.meta_description.content) {
            if (data.meta_description.status === 'good') basicSeoPoints += 1;
            else if (data.meta_description.status === 'warning') basicSeoPoints += 0.5;
        }
        
        // Canonical URL
        if (data.canonical.content) basicSeoPoints += 1;
        
        // Headings
        if (data.headings.h1.length === 1) basicSeoPoints += 1;
        else if (data.headings.h1.length > 1) basicSeoPoints += 0.5;
        
        const basicSeoScore = Math.round((basicSeoPoints / basicSeoTotal) * 100);
        
        // Social Media score (30% of total)
        let socialPoints = 0;
        let socialTotal = 6;
        
        // Open Graph tags
        if (data.og_tags['og:title'] && data.og_tags['og:title'].content) socialPoints += 1;
        if (data.og_tags['og:description'] && data.og_tags['og:description'].content) socialPoints += 1;
        if (data.og_tags['og:image'] && data.og_tags['og:image'].content) socialPoints += 1;
        
        // Twitter Card tags
        if (data.twitter_tags['twitter:card'] && data.twitter_tags['twitter:card'].content) socialPoints += 1;
        if (data.twitter_tags['twitter:title'] && data.twitter_tags['twitter:title'].content) socialPoints += 1;
        if (data.twitter_tags['twitter:image'] && data.twitter_tags['twitter:image'].content) socialPoints += 1;
        
        const socialScore = Math.round((socialPoints / socialTotal) * 100);
        
        // Structure score (30% of total)
        let structurePoints = 0;
        let structureTotal = 3;
        
        // Headings structure
        if (data.headings.h1.length >= 1) structurePoints += 1;
        if (data.headings.h2.length >= 1) structurePoints += 1;
        
        // Images with alt text
        if (data.images.total > 0) {
            const altRatio = data.images.with_alt / data.images.total;
            if (altRatio >= 0.8) structurePoints += 1;
            else if (altRatio >= 0.5) structurePoints += 0.5;
        } else {
            structurePoints += 1; // No images is still good for structure
        }
        
        const structureScore = Math.round((structurePoints / structureTotal) * 100);
        
        // Calculate overall score (weighted)
        const overallScore = Math.round(
            (basicSeoScore * 0.4) + (socialScore * 0.3) + (structureScore * 0.3)
        );
        
        // Update score displays
        updateTextContent('basic-seo-score', basicSeoScore + '%');
        updateTextContent('social-score', socialScore + '%');
        updateTextContent('structure-score', structureScore + '%');
        updateTextContent('seo-score-value', overallScore);
        
        // Apply score color and label
        const scoreCircle = document.getElementById('seo-score-circle');
        let scoreLabel = '';
        
        if (overallScore >= 90) {
            scoreCircle.className = 'score-circle score-excellent';
            scoreLabel = 'Excellent';
        } else if (overallScore >= 70) {
            scoreCircle.className = 'score-circle score-good';
            scoreLabel = 'Good';
        } else if (overallScore >= 50) {
            scoreCircle.className = 'score-circle score-average';
            scoreLabel = 'Average';
        } else {
            scoreCircle.className = 'score-circle score-poor';
            scoreLabel = 'Needs Improvement';
        }
        
        updateTextContent('seo-score-label', scoreLabel);
    }
    
    // Helper Functions
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
    
    function updateStatusElement(elementId, status) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = statusIcons[status] || '';
        }
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        showElement(errorAlert);
    }
    
    // Initialize tooltips if available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});
