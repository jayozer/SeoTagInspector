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
