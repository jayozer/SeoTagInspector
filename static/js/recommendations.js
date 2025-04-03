// Update the recommendations display function
function displayRecommendations(recommendations) {
    // Update the main recommendations container
    updateRecommendationsContainer('recommendations-container', recommendations);
    
    // Update the tab recommendations container if it exists
    updateRecommendationsContainer('tab-recommendations-container', recommendations);
}

function updateRecommendationsContainer(containerId, recommendations) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Recommendations container '${containerId}' not found`);
        return;
    }
    
    container.innerHTML = '';
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="text-muted">No recommendations available.</p>';
        return;
    }
    
    recommendations.forEach(recommendation => {
        const severity = recommendation.severity || 'warning';
        const statusClass = severity === 'critical' ? 'danger' : (severity === 'warning' ? 'warning' : 'success');
        
        const recommendationItem = document.createElement('div');
        recommendationItem.className = `card mb-3 border-${statusClass}-custom`;
        recommendationItem.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                    <h4 class="h6 mb-0">${recommendation.title}</h4>
                    <span class="ms-auto badge bg-${statusClass}">${severity.toUpperCase()}</span>
                </div>
                <p class="mb-0 small">${recommendation.description}</p>
            </div>
        `;
        
        container.appendChild(recommendationItem);
    });
}
