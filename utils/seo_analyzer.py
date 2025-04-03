import re
import logging
import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup

def analyze_url(url):
    """
    Analyze a URL and extract SEO-related information
    
    Args:
        url (str): The URL to analyze
        
    Returns:
        dict: Dictionary containing SEO analysis results
    """
    # Validate URL format
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
        
    # Parse URL components
    parsed_url = urlparse(url)
    
    # Fetch HTML content with appropriate headers
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching URL: {e}")
        raise Exception(f"Could not fetch the website: {str(e)}")
    
    # Parse HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Initialize results dictionary
    results = {
        'url': url,
        'domain': parsed_url.netloc,
        'title': {},
        'meta_description': {},
        'og_tags': {},
        'twitter_tags': {},
        'canonical': {},
        'robots': {},
        'headings': {
            'h1': [],
            'h2': [],
            'h3': []
        },
        'images': {
            'with_alt': 0,
            'without_alt': 0,
            'total': 0
        },
        'recommendations': []
    }
    
    # Extract title
    title_tag = soup.find('title')
    if title_tag and title_tag.string:
        title_text = title_tag.string.strip()
        results['title'] = {
            'content': title_text,
            'length': len(title_text),
            'status': 'good' if 10 <= len(title_text) <= 60 else 'warning'
        }
        
        if not title_text:
            results['recommendations'].append('Add a title tag to your page')
        elif len(title_text) < 10:
            results['recommendations'].append('Your title tag is too short (less than 10 characters)')
        elif len(title_text) > 60:
            results['recommendations'].append('Your title tag is too long (more than 60 characters)')
    else:
        results['title'] = {
            'content': None,
            'length': 0,
            'status': 'error'
        }
        results['recommendations'].append('Add a title tag to your page')
    
    # Extract meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        desc_text = meta_desc['content'].strip()
        results['meta_description'] = {
            'content': desc_text,
            'length': len(desc_text),
            'status': 'good' if 50 <= len(desc_text) <= 160 else 'warning'
        }
        
        if len(desc_text) < 50:
            results['recommendations'].append('Your meta description is too short (less than 50 characters)')
        elif len(desc_text) > 160:
            results['recommendations'].append('Your meta description is too long (more than 160 characters)')
    else:
        results['meta_description'] = {
            'content': None,
            'length': 0,
            'status': 'error'
        }
        results['recommendations'].append('Add a meta description to your page')
    
    # Extract Open Graph tags
    og_tags = {
        'og:title': soup.find('meta', property='og:title'),
        'og:description': soup.find('meta', property='og:description'),
        'og:image': soup.find('meta', property='og:image'),
        'og:url': soup.find('meta', property='og:url'),
        'og:type': soup.find('meta', property='og:type'),
        'og:site_name': soup.find('meta', property='og:site_name')
    }
    
    for tag_name, tag in og_tags.items():
        if tag and tag.get('content'):
            results['og_tags'][tag_name] = {
                'content': tag['content'],
                'status': 'good'
            }
        else:
            results['og_tags'][tag_name] = {
                'content': None,
                'status': 'error'
            }
    
    # Check for essential Open Graph tags
    if not og_tags['og:title'] or not og_tags['og:title'].get('content'):
        results['recommendations'].append('Add og:title meta tag for better social sharing')
    if not og_tags['og:description'] or not og_tags['og:description'].get('content'):
        results['recommendations'].append('Add og:description meta tag for better social sharing')
    if not og_tags['og:image'] or not og_tags['og:image'].get('content'):
        results['recommendations'].append('Add og:image meta tag for better social sharing')
    
    # Extract Twitter Card tags
    twitter_tags = {
        'twitter:card': soup.find('meta', attrs={'name': 'twitter:card'}),
        'twitter:title': soup.find('meta', attrs={'name': 'twitter:title'}),
        'twitter:description': soup.find('meta', attrs={'name': 'twitter:description'}),
        'twitter:image': soup.find('meta', attrs={'name': 'twitter:image'})
    }
    
    for tag_name, tag in twitter_tags.items():
        if tag and tag.get('content'):
            results['twitter_tags'][tag_name] = {
                'content': tag['content'],
                'status': 'good'
            }
        else:
            results['twitter_tags'][tag_name] = {
                'content': None,
                'status': 'error'
            }
    
    # Check for essential Twitter Card tags
    if not twitter_tags['twitter:card'] or not twitter_tags['twitter:card'].get('content'):
        results['recommendations'].append('Add twitter:card meta tag for better Twitter sharing')
    if not twitter_tags['twitter:title'] or not twitter_tags['twitter:title'].get('content'):
        results['recommendations'].append('Add twitter:title meta tag for better Twitter sharing')
    
    # Extract canonical URL
    canonical = soup.find('link', rel='canonical')
    if canonical and canonical.get('href'):
        canonical_url = canonical['href']
        # Check if canonical URL is absolute
        if not bool(urlparse(canonical_url).netloc):
            canonical_url = urljoin(url, canonical_url)
        
        results['canonical'] = {
            'content': canonical_url,
            'status': 'good' if canonical_url else 'error'
        }
    else:
        results['canonical'] = {
            'content': None,
            'status': 'error'
        }
        results['recommendations'].append('Add a canonical URL to your page')
    
    # Extract robots directives
    robots_meta = soup.find('meta', attrs={'name': 'robots'})
    if robots_meta and robots_meta.get('content'):
        results['robots'] = {
            'content': robots_meta['content'],
            'status': 'good'
        }
        
        # Check for noindex directive
        if 'noindex' in results['robots']['content'].lower():
            results['recommendations'].append('Your page has a noindex directive, search engines will not index it')
    else:
        results['robots'] = {
            'content': None,
            'status': 'warning'
        }
    
    # Extract headings
    for i in range(1, 4):
        headings = soup.find_all(f'h{i}')
        for heading in headings:
            text = heading.get_text().strip()
            if text:
                results['headings'][f'h{i}'].append(text)
    
    # Check for H1 headings
    if not results['headings']['h1']:
        results['recommendations'].append('Add an H1 heading to your page')
    elif len(results['headings']['h1']) > 1:
        results['recommendations'].append('Your page has multiple H1 headings, consider using only one for better SEO')
    
    # Count images and check for alt text
    images = soup.find_all('img')
    results['images']['total'] = len(images)
    
    for img in images:
        if img.get('alt'):
            results['images']['with_alt'] += 1
        else:
            results['images']['without_alt'] += 1
    
    if results['images']['without_alt'] > 0:
        results['recommendations'].append(f'Add alt text to {results["images"]["without_alt"]} images for better accessibility and SEO')
    
    # Additional SEO checks
    
    # Check meta viewport
    viewport = soup.find('meta', attrs={'name': 'viewport'})
    if not viewport:
        results['recommendations'].append('Add a meta viewport tag for better mobile compatibility')
    
    # Check for schema.org structured data
    schema_tags = soup.find_all('script', attrs={'type': 'application/ld+json'})
    if not schema_tags:
        results['recommendations'].append('Consider adding schema.org structured data for rich snippets in search results')
    
    # Check for favicon
    favicon = soup.find('link', rel=re.compile(r'icon', re.I))
    if not favicon:
        results['recommendations'].append('Add a favicon to your website')
    
    return results
