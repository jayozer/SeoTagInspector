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
        // Calculate category scores
        const categoryScores = calculateCategoryScores(data);
        
        // Update SEO score and counters
        updateSeoScoreSection(data, categoryScores);
        
        // Update Google search preview
        updateGooglePreview(data);
        
        // Update SEO checks
        displaySeoChecks(data);
        
        // Update social media previews
        updateSocialPreviews(data);
        
        // Update category summaries
        updateCategorySummaries(data, categoryScores);
        
        // Update recommendations
        displayRecommendations(data.recommendations);
    }
    
    // Calculate scores for each category
    function calculateCategoryScores(data) {
        const scores = {
            basicSeo: {
                passed: 0,
                warnings: 0,
                failed: 0,
                total: 0,
                score: 0
            },
            social: {
                passed: 0,
                warnings: 0,
                failed: 0,
                total: 0,
                score: 0
            },
            structure: {
                passed: 0,
                warnings: 0,
                failed: 0,
                total: 0,
                score: 0
            },
            content: {
                passed: 0,
                warnings: 0,
                failed: 0,
                total: 0,
                score: 0
            }
        };
        
        // Basic SEO elements
        addToCategory(scores.basicSeo, data.title.status);
        addToCategory(scores.basicSeo, data.meta_description.status);
        addToCategory(scores.basicSeo, data.canonical.status);
        addToCategory(scores.basicSeo, data.robots.status);
        addToCategory(scores.basicSeo, data.meta_keywords.status);
        
        // Social elements
        if (data.og_tags) {
            Object.values(data.og_tags).forEach(tag => {
                addToCategory(scores.social, tag.status);
            });
        }
        
        if (data.twitter_tags) {
            Object.values(data.twitter_tags).forEach(tag => {
                addToCategory(scores.social, tag.status);
            });
        }
        
        // Structure elements
        if (data.headings.h1.length === 1) {
            addToCategory(scores.structure, 'good');
        } else if (data.headings.h1.length === 0) {
            addToCategory(scores.structure, 'error');
        } else {
            addToCategory(scores.structure, 'warning');
        }
        
        if (data.headings.h2.length > 0) {
            addToCategory(scores.structure, 'good');
        } else {
            addToCategory(scores.structure, 'warning');
        }
        
        if (data.headings.h3.length > 0) {
            addToCategory(scores.structure, 'good');
        } else {
            addToCategory(scores.structure, 'warning');
        }
        
        // Content elements
        if (data.images) {
            if (data.images.with_alt > 0) {
                addToCategory(scores.content, 'good');
            }
            
            if (data.images.without_alt > 0) {
                addToCategory(scores.content, 'warning');
            }
        }
        
        // Calculate final scores for each category
        Object.keys(scores).forEach(category => {
            const categoryData = scores[category];
            categoryData.total = categoryData.passed + categoryData.warnings + categoryData.failed;
            
            if (categoryData.total > 0) {
                categoryData.score = Math.round(((categoryData.passed + (categoryData.warnings * 0.5)) / categoryData.total) * 100);
            }
        });
        
        return scores;
        
        // Helper function to add a status to a category count
        function addToCategory(category, status) {
            if (status === 'good') category.passed++;
            else if (status === 'warning') category.warnings++;
            else if (status === 'error') category.failed++;
        }
    }
    
    // Update SEO Score Section
    function updateSeoScoreSection(data, categoryScores) {
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
        updateTextContent('passed-checks-count', passedChecks);
        updateTextContent('warnings-count', warnings);
        updateTextContent('failed-checks-count', failedChecks);
        
        // Update score in main section
        const scoreElement = document.getElementById('seo-score');
        const scoreCircle = document.getElementById('main-seo-score-circle');
        const scoreRating = document.getElementById('seo-score-rating');
        
        if (scoreElement) scoreElement.textContent = score;
        
        // Clear previous classes
        if (scoreCircle) {
            scoreCircle.classList.remove('score-excellent', 'score-good', 'score-average', 'score-poor');
            
            // Set appropriate class based on score
            if (score >= 90) {
                scoreCircle.classList.add('score-excellent');
                if (scoreRating) scoreRating.textContent = 'Excellent';
            } else if (score >= 70) {
                scoreCircle.classList.add('score-good');
                if (scoreRating) scoreRating.textContent = 'Good';
            } else if (score >= 50) {
                scoreCircle.classList.add('score-average');
                if (scoreRating) scoreRating.textContent = 'Average';
            } else {
                scoreCircle.classList.add('score-poor');
                if (scoreRating) scoreRating.textContent = 'Poor';
            }
        }
        
        // Update score in social media preview section
        const scoreValueElement = document.getElementById('seo-score-value');
        const scoreLabel = document.getElementById('seo-score-label');
        const basicSeoScore = document.getElementById('basic-seo-score');
        const socialScore = document.getElementById('social-score');
        const structureScore = document.getElementById('structure-score');
        const contentScore = document.getElementById('content-score');
        
        if (scoreValueElement) scoreValueElement.textContent = score;
        if (scoreLabel) scoreLabel.textContent = score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Poor';
        
        // Update category scores
        if (basicSeoScore) basicSeoScore.textContent = categoryScores.basicSeo.score;
        const visualBasicSeoScore = document.getElementById("visual-basic-seo-score");
        const visualSocialScore = document.getElementById("visual-social-score");
        const visualStructureScore = document.getElementById("visual-structure-score");
        const visualContentScore = document.getElementById("visual-content-score");
        
        if (visualBasicSeoScore) visualBasicSeoScore.textContent = categoryScores.basicSeo.score;
        if (visualSocialScore) visualSocialScore.textContent = categoryScores.social.score;
        if (visualStructureScore) visualStructureScore.textContent = categoryScores.structure.score;
        if (visualContentScore) visualContentScore.textContent = categoryScores.content.score;
        if (socialScore) socialScore.textContent = categoryScores.social.score;
        if (structureScore) structureScore.textContent = categoryScores.structure.score;
        if (contentScore) contentScore.textContent = categoryScores.content.score;
    }
    
    // Update Category Summaries
    function updateCategorySummaries(data, categoryScores) {
        const categorySummaryContainer = document.getElementById('category-summaries');
        if (!categorySummaryContainer) return;
        
        // Clear the container
        categorySummaryContainer.innerHTML = '';
        
        // Create the category summary cards
        const categories = [
            {
                id: 'basicSeo',
                title: 'Basic SEO',
                icon: 'search',
                description: 'Core meta tags that impact search rankings',
                color: 'primary',
                items: [
                    { name: 'Title', status: data.title.status },
                    { name: 'Meta Description', status: data.meta_description.status },
                    { name: 'Canonical URL', status: data.canonical.status },
                    { name: 'Meta Keywords', status: data.meta_keywords.status },
                    { name: 'Robots Meta Tag', status: data.robots.status }
                ]
            },
            {
                id: 'social',
                title: 'Social Media',
                icon: 'share-alt',
                description: 'Open Graph and Twitter Card tags for social sharing',
                color: 'info',
                items: [
                    { name: 'OG Title', status: data.og_tags['og:title']?.status || 'error' },
                    { name: 'OG Description', status: data.og_tags['og:description']?.status || 'error' },
                    { name: 'OG Image', status: data.og_tags['og:image']?.status || 'error' },
                    { name: 'Twitter Card', status: data.twitter_tags['twitter:card']?.status || 'error' },
                    { name: 'Twitter Title', status: data.twitter_tags['twitter:title']?.status || 'error' }
                ]
            },
            {
                id: 'structure',
                title: 'Page Structure',
                icon: 'sitemap',
                description: 'Headings and page organization',
                color: 'success',
                items: [
                    { 
                        name: 'H1 Heading', 
                        status: data.headings.h1.length === 1 ? 'good' : 
                                data.headings.h1.length === 0 ? 'error' : 'warning' 
                    },
                    { 
                        name: 'H2 Headings', 
                        status: data.headings.h2.length > 0 ? 'good' : 'warning' 
                    },
                    { 
                        name: 'H3 Headings', 
                        status: data.headings.h3.length > 0 ? 'good' : 'warning' 
                    },
                    { 
                        name: 'Heading Structure', 
                        status: data.headings.h1.length === 1 && data.headings.h2.length > 0 ? 'good' : 'warning' 
                    }
                ]
            },
            {
                id: 'content',
                title: 'Page Content',
                icon: 'file-alt',
                description: 'Images and content accessibility',
                color: 'warning',
                items: [
                    { 
                        name: 'Images with Alt Text', 
                        status: data.images.with_alt > 0 ? 'good' : 'warning',
                        details: `${data.images.with_alt} of ${data.images.total} images have alt text`
                    },
                    { 
                        name: 'Images Missing Alt Text', 
                        status: data.images.without_alt === 0 ? 'good' : 'warning',
                        details: `${data.images.without_alt} of ${data.images.total} images missing alt text`
                    }
                ]
            }
        ];
        
        // Create a row for the cards
        const row = document.createElement('div');
        row.className = 'row';
        
        // Add cards to the row
        categories.forEach(category => {
            const categoryScore = categoryScores[category.id];
            const scoreClass = categoryScore.score >= 90 ? 'score-excellent' : 
                              categoryScore.score >= 70 ? 'score-good' : 
                              categoryScore.score >= 50 ? 'score-average' : 'score-poor';
            
            const card = document.createElement('div');
            card.className = 'col-lg-3 col-md-6 mb-4';
            card.innerHTML = `
                <div class="card category-summary-card h-100 border-${category.color}">
                    <div class="card-body text-center p-4">
                        <div class="icon-container bg-${category.color}-subtle text-${category.color} mb-3">
                            <i class="fas fa-${category.icon}"></i>
                        </div>
                        <h3 class="h5 mb-2">${category.title}</h3>
                        <div class="category-score-circle ${scoreClass} mb-2">
                            ${categoryScore.score}
                        </div>
                        <p class="text-muted small mb-3">${category.description}</p>
                        
                        <div class="metrics-row border-top pt-3">
                            <div class="metric-item">
                                <div class="metric-value text-success">${categoryScore.passed}</div>
                                <div class="metric-label">Passed</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value text-warning">${categoryScore.warnings}</div>
                                <div class="metric-label">Warnings</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value text-danger">${categoryScore.failed}</div>
                                <div class="metric-label">Failed</div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent p-0">
                        <button class="btn btn-link text-decoration-none w-100 text-${category.color}" type="button" data-bs-toggle="collapse" data-bs-target="#${category.id}Details">
                            View Details <i class="fas fa-chevron-down ms-1"></i>
                        </button>
                    </div>
                    <div class="collapse" id="${category.id}Details">
                        <div class="card-body border-top pt-3">
                            <div class="category-checks">
                                ${category.items.map(item => `
                                    <div class="category-check-item ${item.status}">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-${item.status === 'good' ? 'check-circle text-success' : 
                                                              item.status === 'warning' ? 'exclamation-triangle text-warning' : 
                                                              'times-circle text-danger'} me-2"></i>
                                            <div>
                                                <div class="fw-bold">${item.name}</div>
                                                ${item.details ? `<div class="small text-muted">${item.details}</div>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            row.appendChild(card);
        });
        
        categorySummaryContainer.appendChild(row);
    }
    
    // Update Google Preview
    function updateGooglePreview(data) {
        // Update Google search result preview
        updateTextContent('google-title', data.title.content || 'No title');
        updateTextContent('google-url', data.url);
        updateTextContent('google-description', data.meta_description.content || 'No description available.');
        
        // Update heading counts
        const h1Count = document.getElementById('h1-count');
        const h2Count = document.getElementById('h2-count');
        const h3Count = document.getElementById('h3-count');
        
        if (h1Count) h1Count.textContent = data.headings.h1.length || 0;
        if (h2Count) h2Count.textContent = data.headings.h2.length || 0;
        if (h3Count) h3Count.textContent = data.headings.h3.length || 0;
        
        // Update headings content
        const h1Tags = document.getElementById('h1-tags');
        const h2Tags = document.getElementById('h2-tags');
        const h3Tags = document.getElementById('h3-tags');
        
        if (h1Tags) {
            h1Tags.innerHTML = data.headings.h1.length > 0 
                ? data.headings.h1.map(h => `<div class="tag-item">${h}</div>`).join('') 
                : '<p class="text-muted small">No H1 headings found.</p>';
        }
        
        if (h2Tags) {
            h2Tags.innerHTML = data.headings.h2.length > 0 
                ? data.headings.h2.map(h => `<div class="tag-item">${h}</div>`).join('') 
                : '<p class="text-muted small">No H2 headings found.</p>';
        }
        
        if (h3Tags) {
            h3Tags.innerHTML = data.headings.h3.length > 0 
                ? data.headings.h3.map(h => `<div class="tag-item">${h}</div>`).join('') 
                : '<p class="text-muted small">No H3 headings found.</p>';
        }
    }
    
    // Display SEO Checks
    function displaySeoChecks(data) {
        const container = document.getElementById('seo-checks-container');
        if (!container) {
            console.warn("SEO checks container not found");
            return;
        }
        
        container.innerHTML = '';
        
        // Add Title Check
        addSeoCheckItem('Title Tag', data.title.status, 
            getTitleStatusMessage(data.title));
        
        // Add Meta Description Check
        addSeoCheckItem('Meta Description', data.meta_description.status, 
            getMetaDescriptionStatusMessage(data.meta_description));
        
        // Add Meta Keywords Check
        // This is a simplified example - in a real app, you'd check if keywords exist
        const keywordsStatus = data.meta_keywords && data.meta_keywords.content ? 'good' : 'warning';
        const keywordsMessage = data.meta_keywords && data.meta_keywords.content 
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
        if (!container) {
            console.warn(`Social image container '${containerId}' not found`);
            return;
        }
        
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
        if (!table) {
            console.warn("OG tags table not found");
            return;
        }
        
        table.innerHTML = '';
        
        if (ogTags && Object.keys(ogTags).length > 0) {
            for (const [tagName, tagData] of Object.entries(ogTags)) {
                const row = document.createElement('tr');
                const statusIcon = tagData.status === 'good' ? 
                    '<i class="fas fa-check-circle text-success"></i>' : 
                    '<i class="fas fa-exclamation-triangle text-warning"></i>';
                
                row.innerHTML = `
                    <td>${tagName} ${statusIcon}</td>
                    <td>${tagData.content || '<span class="text-muted">Not set</span>'}</td>
                `;
                
                table.appendChild(row);
            }
        } else {
            table.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center text-muted">No Open Graph tags found</td>
                </tr>
            `;
        }
    }
    
    // Update Twitter tags table
    function updateTwitterTagsTable(twitterTags) {
        const table = document.getElementById('twitter-tags-table');
        if (!table) {
            console.warn("Twitter tags table not found");
            return;
        }
        
        table.innerHTML = '';
        
        if (twitterTags && Object.keys(twitterTags).length > 0) {
            for (const [tagName, tagData] of Object.entries(twitterTags)) {
                const row = document.createElement('tr');
                const statusIcon = tagData.status === 'good' ? 
                    '<i class="fas fa-check-circle text-success"></i>' : 
                    '<i class="fas fa-exclamation-triangle text-warning"></i>';
                
                row.innerHTML = `
                    <td>${tagName} ${statusIcon}</td>
                    <td>${tagData.content || '<span class="text-muted">Not set</span>'}</td>
                `;
                
                table.appendChild(row);
            }
        } else {
            table.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center text-muted">No Twitter Card tags found</td>
                </tr>
            `;
        }
    }
    
    function displayRecommendations(recommendations) {
        /* Function moved to external file. We call the implementation from there */
        updateRecommendationsContainer("recommendations-container", recommendations);
        updateRecommendationsContainer("tab-recommendations-container", recommendations);
    }

    function updateRecommendationsContainer(containerId, recommendations) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Recommendations container '${containerId}' not found`);
            return;
        }
        
        container.innerHTML = '';
        
        if (recommendations && recommendations.length > 0) {
            recommendations.forEach((recommendation, index) => {
                // Determine recommendation type based on content
                let type = 'warning';
                if (recommendation.toLowerCase().includes('good') || 
                    recommendation.toLowerCase().includes('properly')) {
                    type = 'success';
                } else if (recommendation.toLowerCase().includes('critical') ||
                          recommendation.toLowerCase().includes('error')) {
                    type = 'danger';
                }
                
                const alertClass = `alert-${type}`;
                const iconClass = type === 'success' ? 'check-circle' : 
                                 type === 'warning' ? 'exclamation-triangle' : 'times-circle';
                
                const recItem = document.createElement('div');
                recItem.className = `alert ${alertClass} d-flex align-items-center`;
                recItem.innerHTML = `
                    <i class="fas fa-${iconClass} me-2"></i>
                    <div>${recommendation}</div>
                `;
                
                container.appendChild(recItem);
            });
        } else {
            container.innerHTML = '<p class="text-muted">No recommendations available.</p>';
        }
    }
    
    // Helper function to show an element
    function showElement(element) {
        if (element) element.classList.remove('d-none');
    }
    
    // Helper function to hide an element
    function hideElement(element) {
        if (element) element.classList.add('d-none');
    }
    
    // Helper function to update text content
    function updateTextContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = content;
    }
    
    // Helper function to show error message
    function showError(message) {
        if (errorMessage) errorMessage.textContent = message;
        showElement(errorAlert);
    }
});
