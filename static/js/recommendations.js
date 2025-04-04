// Recommendations handling for SEO Meta Tag Analyzer

function displayRecommendations(recommendations) {
    /* Update both recommendation containers */
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
            let recommendationType = 'warning';
            let borderClass = 'border-warning-custom';
            let iconClass = 'fa-exclamation-triangle text-warning';
            
            if (recommendation.includes('missing') || recommendation.includes('error') || recommendation.includes('critical')) {
                recommendationType = 'error';
                borderClass = 'border-danger-custom';
                iconClass = 'fa-times-circle text-danger';
            } else if (recommendation.includes('good') || recommendation.includes('excellent') || recommendation.includes('optimized')) {
                recommendationType = 'success';
                borderClass = 'border-success-custom';
                iconClass = 'fa-check-circle text-success';
            }
            
            // Create recommendation card
            const card = document.createElement('div');
            card.className = `card mb-2 ${borderClass}`;
            card.innerHTML = `
                <div class="card-body py-2 px-3">
                    <div class="d-flex align-items-center">
                        <i class="fas ${iconClass} me-2"></i>
                        <span class="small">${recommendation}</span>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    } else {
        // No recommendations
        container.innerHTML = '<div class="text-center text-muted py-3">No recommendations available.</div>';
    }
}
