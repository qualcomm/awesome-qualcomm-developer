/* 
Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:
* Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the following
  disclaimer in the documentation and/or other materials provided
  with the distribution.
* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived
  from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT
ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS
BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const repoCardsContainer = document.getElementById('repo-cards-container');
    const tagFiltersContainer = document.getElementById('tag-filters-container');
    const platformFiltersContainer = document.getElementById('platform-filters-container');
    const activePlatformDisplay = document.getElementById('active-platform-display');
    const activeTagsDisplay = document.getElementById('active-tags-display');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');
    const noResultsDiv = document.getElementById('no-results');
    const heroBlockContainerElem = document.getElementById('hero-block-container'); // Renamed for clarity
    const heroSlider = document.getElementById('hero-slider'); // Changed from hero-block
    const sortCriteriaSelect = document.getElementById('sort-criteria');
    const sortDirectionSelect = document.getElementById('sort-direction');
    const paginationContainer = document.getElementById('pagination-container');

    // State
    let allRepos = [];
    let showcaseRepos = [];
    let currentShowcaseIndex = 0;
    let heroInterval;
    const HERO_ROTATION_INTERVAL = 7000; // 7 seconds

    let uniquePlatforms = new Set();
    let uniqueTags = new Set();
    let activePlatform = ''; // Empty string means no platform selected
    let activeTags = new Set();
    let searchTerm = '';

    let currentSortCriteria = 'lastUpdated';
    let currentSortDirection = 'desc';

    const ITEMS_PER_PAGE = 20;
    let currentPage = 1;

    const TOP_N_TAGS = 20; // Max number of tags to show initially
    let allTagsRendered = false; // State for "Show More" tags functionality

    const MANIFEST_FILE = 'data/manifest.json'; // Central manifest file

    async function loadRepoData() {
        try {
            // 1. Fetch the manifest file
            const manifestResponse = await fetch(MANIFEST_FILE);
            if (!manifestResponse.ok) {
                throw new Error(`Failed to load manifest: ${manifestResponse.statusText}`);
            }
            const manifest = await manifestResponse.json();
            const repoDataFiles = manifest.repoFiles;

            if (!repoDataFiles || repoDataFiles.length === 0) {
                console.warn("No repository files listed in manifest.json");
                allRepos = []; // Ensure allRepos is an empty array
            } else {
                // 2. Fetch all individual repo JSON files listed in the manifest
                const responses = await Promise.all(repoDataFiles.map(file => fetch(file)
                    .catch(e => { // Catch fetch errors for individual files
                        console.error(`Error fetching ${file}:`, e);
                        return { ok: false, url: file, error: e }; // Return an object indicating failure
                    })
                ));

                const jsonDataPromises = responses.map(async response => {
                    if (!response.ok) {
                        // Log specific error if available, otherwise generic
                        const errorMsg = response.error ? response.error.message : response.statusText || 'Unknown error';
                        console.error(`Failed to load ${response.url}: ${errorMsg}`);
                        return null;
                    }
                    try {
                        return await response.json();
                    } catch (jsonError) {
                        console.error(`Failed to parse JSON from ${response.url}:`, jsonError);
                        return null;
                    }
                });

                // Wait for all JSON parsing promises to resolve.
                // Each item in resolvedDataItems can be:
                // - a single repo object
                // - an array of repo objects
                // - null (if fetching or parsing failed for that file)
                const resolvedDataItems = await Promise.all(jsonDataPromises);

                // Flatten the array of results and filter out nulls.
                // If an item is an array, its elements are spread. If it's an object, it's included.
                allRepos = resolvedDataItems.flatMap(item => item === null ? [] : (Array.isArray(item) ? item : [item]));
            }

            showcaseRepos = allRepos.filter(repo => repo.isShowcase);

            initializeHeroBlock();
            extractPlatforms();
            extractTags();
            renderPlatformFilters();
            allTagsRendered = false; // Reset for fresh data load
            renderTagFilters();
            setupEventListeners();
            filterAndDisplayRepos();

            document.querySelectorAll('[data-mdb-input-init]').forEach((input) => {
                new mdb.Input(input).init();
            });
            document.querySelectorAll('[data-mdb-ripple-init]').forEach((button) => {
                new mdb.Ripple(button).init();
            });

        } catch (error) {
            console.error("Error loading repository data:", error);
            repoCardsContainer.innerHTML = `<p class="text-danger">Error loading data. Check manifest and JSON files. See console for details.</p>`;
        }
    }

    // --- Hero Block ---
    function initializeHeroBlock() {
        if (showcaseRepos.length > 0) {
            heroBlockContainerElem.style.display = 'block';
            heroSlider.innerHTML = ''; // Clear previous items

            // Set the width of the slider to accommodate all items
            heroSlider.style.width = `${showcaseRepos.length * 50}%`;

            showcaseRepos.forEach(repo => {
                const heroItemDiv = document.createElement('div');
                heroItemDiv.classList.add('hero-item');
                const tagsHtml = repo.tags ? repo.tags.map(tag =>
                    `<span class="badge bg-secondary me-1 mb-1 tag-on-card" data-tag="${tag.toLowerCase()}">${tag}</span>`
                ).join('') : '';
                heroItemDiv.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">
                                <i class="fas fa-star text-warning me-2"></i>
                                <a href="${repo.link}" target="_blank" rel="noopener noreferrer">${repo.name} <i class="fas fa-external-link-alt fa-xs"></i></a>
                            </h5>
                            <p class="card-text text-muted small">
                                ${repo.author ? `By: <a href="https://github.com/${repo.author}" target="_blank" rel="noopener noreferrer">${repo.author} <i class="fas fa-external-link-alt fa-xs"></i></a>` : ''}
                            </p>
                            <p class="card-text text-muted small">
                                ${repo.language ? `<i class="fas fa-code me-1"></i> ${repo.language}` : ''}
                                ${repo.stars !== undefined ? `<span class="ms-2"><i class="fas fa-star me-1"></i> ${repo.stars}</span>` : ''}
                            </p>
                            <p class="card-text flex-grow-1">${repo.description}</p>
                            <div class="mt-auto">
                                <div class="mb-2">${tagsHtml}</div>
                                <p class="card-text small text-muted">
                                    Updated: ${repo.lastUpdated || 'N/A'}
                                </p>
                            </div>

                            <!-- 
                            <p class="card-text flex-grow-1">${repo.description.substring(0, 150)}${repo.description.length > 150 ? '...' : ''}</p>

                            <div class="mt-auto">
                                <p class="card-text small text-muted mb-2">
                                    By: ${repo.author || 'N/A'} | Last Updated: ${repo.lastUpdated || 'N/A'}
                                </p>
                                <a href="${repo.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" data-mdb-ripple-init>View on GitHub</a>
                            </div>
                            -->
                        </div>
                    </div>
                `;
                heroSlider.appendChild(heroItemDiv);
            });

            // Re-init ripples for new buttons in hero
            heroSlider.querySelectorAll('[data-mdb-ripple-init]').forEach(btn => new mdb.Ripple(btn).init());

            // Set initial position
            slideHeroTo(currentShowcaseIndex, false); // false for no animation on initial load

            if (showcaseRepos.length > 1) {
                if (heroInterval) clearInterval(heroInterval);
                heroInterval = setInterval(rotateHero, HERO_ROTATION_INTERVAL);
            }
        } else {
            heroBlockContainerElem.style.display = 'none';
        }
    }

    function slideHeroTo(index, animate = true) {
        if (!animate) {
            heroSlider.style.transition = 'none'; // Temporarily disable transition
        }
        const offset = -index * 100; // Percentage offset
        heroSlider.style.transform = `translateX(${offset}%)`;

        if (!animate) {
            // Force reflow to apply transform immediately without transition
            // then re-enable transition for subsequent slides
            heroSlider.offsetHeight; // Reading offsetHeight forces reflow
            heroSlider.style.transition = 'transform 0.7s ease-in-out';
        }
    }

    function rotateHero() {
        currentShowcaseIndex = (currentShowcaseIndex + 1) % showcaseRepos.length;
        slideHeroTo(currentShowcaseIndex);
    }

    // --- Platform Filtering ---
    function extractPlatforms() {
        uniquePlatforms.clear();
        allRepos.forEach(repo => {
            if (repo.platforms && Array.isArray(repo.platforms)) {
                repo.platforms.forEach(platform => {
                    if (typeof platform === 'string') {
                        uniquePlatforms.add(platform.toLowerCase());
                    }
                });
            }
        });
    }

    function renderPlatformFilters() {
        platformFiltersContainer.innerHTML = '';
        const sortedPlatforms = Array.from(uniquePlatforms).sort();
        sortedPlatforms.forEach(platform => {
            const platformButton = document.createElement('button');
            platformButton.classList.add('btn', 'btn-sm', 'btn-outline-info', 'm-1', 'platform-filter');
            platformButton.setAttribute('data-mdb-ripple-init', '');
            platformButton.dataset.platform = platform;
            platformButton.textContent = platform.charAt(0).toUpperCase() + platform.slice(1); // Capitalize
            platformFiltersContainer.appendChild(platformButton);
        });
        platformFiltersContainer.querySelectorAll('[data-mdb-ripple-init]').forEach(btn => new mdb.Ripple(btn).init());
    }
    // --- Tag Filtering (same as before) ---
    function extractTags() {
        uniqueTags.clear();
        allRepos.forEach(repo => {
            if (repo.tags) repo.tags.forEach(tag => uniqueTags.add(tag.toLowerCase()));
        });
    }

    function renderTagFilters() {
        tagFiltersContainer.innerHTML = '';

        // 1. Calculate tag frequencies
        const tagCounts = {};
        allRepos.forEach(repo => {
            if (repo.tags && Array.isArray(repo.tags)) {
                repo.tags.forEach(tag => {
                    const lowerTag = tag.toLowerCase();
                    tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
                });
            }
        });

        // 2. Sort uniqueTags by frequency (descending), then alphabetically (ascending)
        const sortedUniqueTags = Array.from(uniqueTags)
            .map(tag => ({ name: tag, count: tagCounts[tag] || 0 }))
            .sort((a, b) => {
                if (b.count === a.count) {
                    return a.name.localeCompare(b.name); // Alphabetical for ties
                }
                return b.count - a.count; // By count descending
            })
            .map(item => item.name); // Get just the names

        // 3. Determine which tags to display
        const tagsToDisplay = (allTagsRendered || sortedUniqueTags.length <= TOP_N_TAGS) ?
            sortedUniqueTags :
            sortedUniqueTags.slice(0, TOP_N_TAGS);

        tagsToDisplay.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'm-1', 'tag-filter');
            tagButton.setAttribute('data-mdb-ripple-init', '');
            tagButton.dataset.tag = tag;
            tagButton.textContent = `${tag} (${tagCounts[tag] || 0})`; // Show count on tag
            tagFiltersContainer.appendChild(tagButton);
        });

        // 4. Add "Show More" button if needed
        if (!allTagsRendered && sortedUniqueTags.length > TOP_N_TAGS) {
            const showMoreButton = document.createElement('button');
            showMoreButton.classList.add('btn', 'btn-link', 'btn-sm', 'p-0', 'ms-1', 'mt-2', 'd-block'); // d-block for new line
            showMoreButton.textContent = `Show all ${sortedUniqueTags.length} tags...`;
            showMoreButton.addEventListener('click', () => {
                allTagsRendered = true;
                renderTagFilters(); // Re-render with all tags
            }, { once: true }); // Event listener will only run once
            tagFiltersContainer.appendChild(showMoreButton);
        }

        // Initialize MDB ripples for newly added buttons
        tagFiltersContainer.querySelectorAll('[data-mdb-ripple-init]').forEach(btn => new mdb.Ripple(btn).init());
    }
    function togglePlatformFilter(platform) {
        if (activePlatform === platform) {
            activePlatform = ''; // Deselect if clicking the active one
        } else {
            activePlatform = platform;
        }
        currentPage = 1;
        filterAndDisplayRepos();
    }

    function toggleTagFilter(tag) {
        if (activeTags.has(tag)) {
            activeTags.delete(tag);
        } else {
            activeTags.add(tag);
        }
        currentPage = 1; // Reset page when tags change
        filterAndDisplayRepos();
    }

    function updateActivePlatformButtons() {
        document.querySelectorAll('.platform-filter').forEach(button => {
            const platform = button.dataset.platform;
            button.classList.toggle('active', activePlatform === platform);
            button.classList.toggle('btn-info', activePlatform === platform);
            button.classList.toggle('btn-outline-info', activePlatform !== platform);
        });
    }

    function updateActiveFiltersUI() {
        document.querySelectorAll('.tag-filter').forEach(button => {
            const tag = button.dataset.tag;
            if (activeTags.has(tag)) {
                button.classList.replace('btn-outline-primary', 'btn-primary');
                button.classList.add('active');
            } else {
                button.classList.replace('btn-primary', 'btn-outline-primary');
                button.classList.remove('active');
            }
        });

        // Update active platform display text
        if (activePlatform) {
            activePlatformDisplay.textContent = `(${activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)})`;
        } else {
            activePlatformDisplay.textContent = '';
        }

        // Update active tags display text
        if (activeTags.size > 0) {
            activeTagsDisplay.textContent = `(${Array.from(activeTags).join(', ')})`;
        } else {
            activeTagsDisplay.textContent = '';
        }

        // Show/hide clear filters button
        if (activePlatform || activeTags.size > 0) {
            clearFiltersBtn.classList.remove('d-none');
        } else {
            clearFiltersBtn.classList.add('d-none');
        }
    }

    // --- Search (same as before) ---
    function handleSearch() {
        searchTerm = searchInput.value.toLowerCase().trim();
        currentPage = 1;
        filterAndDisplayRepos();
        clearSearchButton.classList.toggle('d-none', !searchTerm);
    }

    // --- Sorting (same as before) ---
    function applySorting(repos) {
        return [...repos].sort((a, b) => {
            let valA, valB;
            switch (currentSortCriteria) {
                case 'stars':
                    valA = a.stars || 0; valB = b.stars || 0; break;
                case 'lastUpdated':
                    valA = new Date(a.lastUpdated || 0); valB = new Date(b.lastUpdated || 0); break;
                case 'author':
                    valA = (a.author || '').toLowerCase(); valB = (b.author || '').toLowerCase(); break;
                case 'name': default:
                    valA = (a.name || '').toLowerCase(); valB = (b.name || '').toLowerCase(); break;
            }
            if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // --- Pagination (same as before) ---
    function getPaginatedData(repos) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return repos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const paginationUl = paginationContainer.querySelector('.pagination');
        paginationUl.innerHTML = '';

        if (totalPages <= 1) {
            paginationContainer.style.setProperty('display', 'none', 'important');
            return;
        }
        paginationContainer.style.setProperty('display', 'flex', 'important');

        const createPageLink = (text, page, isDisabled = false, isActive = false, isIcon = false) => {
            const li = document.createElement('li');
            li.classList.add('page-item');
            if (isDisabled) li.classList.add('disabled');
            if (isActive) li.classList.add('active');
            const a = document.createElement('a');
            a.classList.add('page-link');
            a.href = '#';
            a.dataset.page = page;
            if (isIcon) a.setAttribute('aria-label', text);
            a.innerHTML = isIcon ? `<span aria-hidden="true">${text}</span>` : text;
            li.appendChild(a);
            return li;
        };

        paginationUl.appendChild(createPageLink('«', currentPage - 1, currentPage === 1, false, true));
        for (let i = 1; i <= totalPages; i++) {
            paginationUl.appendChild(createPageLink(i, i, false, i === currentPage));
        }
        paginationUl.appendChild(createPageLink('»', currentPage + 1, currentPage === totalPages, false, true));

        paginationUl.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetLi = e.target.closest('.page-item');
                if (targetLi.classList.contains('disabled') || targetLi.classList.contains('active')) return;
                currentPage = parseInt(e.target.closest('a').dataset.page);
                filterAndDisplayRepos();
                window.scrollTo({ top: repoCardsContainer.offsetTop - 70, behavior: 'smooth' });
            });
        });
    }

    // --- Core Filtering and Display Logic (same as before) ---
    function filterAndDisplayRepos() {
        let filteredRepos = allRepos;

        // 1. Filter by Platform
        if (activePlatform) {
            filteredRepos = filteredRepos.filter(repo =>
                repo.platforms &&
                Array.isArray(repo.platforms) &&
                repo.platforms.map(p => p.toLowerCase()).includes(activePlatform)
            );
        }

        // 2. Filter by Tags (on the result of platform filtering)
        if (activeTags.size > 0) {
            filteredRepos = filteredRepos.filter(repo => {
                const repoTagsLower = repo.tags ? repo.tags.map(t => t.toLowerCase()) : [];
                return Array.from(activeTags).every(activeTag => repoTagsLower.includes(activeTag));
            });
        }

        // 3. Filter by Search Term (on the result of platform and tag filtering)
        if (searchTerm) {
            filteredRepos = filteredRepos.filter(repo =>
                (repo.name && repo.name.toLowerCase().includes(searchTerm)) ||
                (repo.description && repo.description.toLowerCase().includes(searchTerm)) ||
                (repo.author && repo.author.toLowerCase().includes(searchTerm)) ||
                (repo.language && repo.language.toLowerCase().includes(searchTerm)) ||
                (repo.platforms && Array.isArray(repo.platforms) && repo.platforms.some(p => p.toLowerCase().includes(searchTerm))) || // Search in multiple platforms
                (repo.tags && repo.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        const sortedRepos = applySorting(filteredRepos);
        const paginatedRepos = getPaginatedData(sortedRepos);
        displayRepos(paginatedRepos);
        updateActivePlatformButtons();
        updateActiveFiltersUI();
        renderPagination(sortedRepos.length);
    }

    function displayRepos(reposToDisplay) {
        repoCardsContainer.innerHTML = '';
        if (reposToDisplay.length === 0 && allRepos.length > 0) { // Only show no results if there was data to begin with
            noResultsDiv.innerHTML = `<h4><i class="fas fa-search-minus me-2"></i>No repositories match your criteria.</h4>
                                      <p>Try adjusting your filters or search term.</p>`;
            noResultsDiv.style.display = 'block';
            return;
        }
        noResultsDiv.style.display = 'none';

        reposToDisplay.forEach(repo => {
            const card = document.createElement('div');
            card.classList.add('col-md-6', 'col-lg-4', 'mb-4');
            const tagsHtml = repo.tags ? repo.tags.map(tag =>
                `<span class="badge bg-secondary me-1 mb-1 tag-on-card" data-tag="${tag.toLowerCase()}">${tag}</span>`
            ).join('') : '';
            card.innerHTML = `
                <div class="card h-100 border">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">
                            <a href="${repo.link}" target="_blank" rel="noopener noreferrer">${repo.name} <i class="fas fa-external-link-alt fa-xs"></i></a>
                        </h5>
                        <p class="card-text text-muted small">
                            ${repo.author ? `By: <a href="https://github.com/${repo.author}" target="_blank" rel="noopener noreferrer">${repo.author} <i class="fas fa-external-link-alt fa-xs"></i></a>` : ''}
                        </p>
                        <p class="card-text text-muted small">
                            ${repo.language ? `<i class="fas fa-code me-1"></i> ${repo.language}` : ''}
                            ${repo.stars !== undefined ? `<span class="ms-2"><i class="fas fa-star me-1"></i> ${repo.stars}</span>` : ''}
                        </p>
                        <p class="card-text flex-grow-1">${repo.description}</p>
                        <div class="mt-auto">
                            <div class="mb-2">${tagsHtml}</div>
                            <p class="card-text small text-muted">
                                Updated: ${repo.lastUpdated || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>`;
            repoCardsContainer.appendChild(card);
        });

        document.querySelectorAll('.tag-on-card').forEach(tagBadge => {
            tagBadge.addEventListener('click', (e) => {
                const tag = e.target.dataset.tag;
                if (!activeTags.has(tag)) activeTags.add(tag);
                searchInput.value = ''; searchTerm = '';
                clearSearchButton.classList.add('d-none');
                currentPage = 1;
                filterAndDisplayRepos();
            });
        });
    }

    // --- Event Listeners Setup (same as before, minor clear search MDB handling) ---
    function setupEventListeners() {
        platformFiltersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('platform-filter')) {
                togglePlatformFilter(e.target.dataset.platform);
            }
        });
        tagFiltersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter')) toggleTagFilter(e.target.dataset.tag);
        });
        clearFiltersBtn.addEventListener('click', () => {
            activePlatform = '';
            activeTags.clear();
            allTagsRendered = false; // Reset tag display state
            currentPage = 1; filterAndDisplayRepos();
        });
        searchInput.addEventListener('input', () => { // Changed from keyup for better clear button behavior
            clearSearchButton.classList.toggle('d-none', !searchInput.value.trim());
        });
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === "Enter") handleSearch();
        });
        searchButton.addEventListener('click', handleSearch);
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            handleSearch();
            const inputInstance = mdb.Input.getInstance(searchInput.closest('.form-outline'));
            if (inputInstance) inputInstance.update(); // For MDB floating label
        });
        sortCriteriaSelect.addEventListener('change', (e) => {
            currentSortCriteria = e.target.value; currentPage = 1; filterAndDisplayRepos();
        });
        sortDirectionSelect.addEventListener('change', (e) => {
            currentSortDirection = e.target.value; currentPage = 1; filterAndDisplayRepos();
        });
    }

    // Initial load
    loadRepoData();
});