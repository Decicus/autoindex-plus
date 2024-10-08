/**
 * Default configuration for the autoindex page
 * Values here will be used if not overridden by the user's configuration.
 */
const AUTOINDEX_CONFIG_DEFAULTS = {
    siteTitle: 'AutoIndex Plus',
    fileTypes: {
        // Individual file types
        pdf: ['pdf'],
        xlsx: ['xlsx', 'xls'],
        docx: ['docx', 'doc'],
        pptx: ['pptx', 'ppt'],
        csv: ['csv'],

        // I'm sure I could continue forever with this
        code: ['json', 'xml', 'yaml', 'yml', 'ini', 'cfg', 'conf', 'html', 'htm', 'sql'],

        // Grouped file types
        archive: ['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar'],
        audio: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'wma', 'aac', 'aiff', 'ape', 'alac'],
        document: ['odt', 'ods', 'odp', 'txt', 'rtf'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tif', 'tiff', 'avif', 'heic', 'jxl'],
        text: ['log', 'md', 'markdown', 'txt'],
        video: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'mpg', 'mpeg', 'm4v'],
    },
    fileIcons: {
        pdf: 'fa-file-pdf',
        xlsx: 'fa-file-excel',
        docx: 'fa-file-word',
        pptx: 'fa-file-powerpoint',
        csv: 'fa-file-csv',
        code: 'fa-file-code',

        archive: 'fa-file-zipper',
        audio: 'fa-file-audio',
        document: 'fa-file-lines',
        image: 'fa-image',
        // Same as document for now
        text: 'fa-file-lines',
        video: 'fa-video',
    },
    ignoreEntries: ['_autoindex'],
    dateTimeLocale: null,
    showCredits: false,
};

/**
 * Format bytes into a human readable format
 *
 * @param {Number} bytes
 * @param {Number} decimals
 * @returns {String}
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get the current URL path, so it can be displayed to the user.
 *
 * @returns {String}
 */
function parseIndexPath()
{
    const url = new URL(window.location.href);
    const path = decodeURIComponent(url.pathname);
    return path;
}

/**
 * Resolve a file's file extension to a Font Awesome icon
 *
 * @param {Object} config Config object
 * @param {Object} file File object, as returned by the autoindex JSON
 * @returns {String} Font Awesome icon class
 */
function resolveFileIcon(config, file)
{
    const defaultIcon = 'fa-file';
    if (!file.type) {
        return defaultIcon;
    }

    if (file.type === 'directory') {
        return 'fa-folder-open';
    }

    const filename = file.name;
    if (!filename.includes('.')) {
        return defaultIcon;
    }

    const fileIcons = config.fileIcons;
    const ext = filename.split('.').pop().toLowerCase();

    for (const type in config.fileTypes) {
        if (config.fileTypes[type].includes(ext)) {
            return fileIcons[type];
        }
    }

    return defaultIcon;
}

/**
 * Helper function to merge the config objects
 * Used recursively to merge nested objects
 *
 * @param {Object} defaultConfig
 * @param {Object} userConfig
 * @returns {Object}
 */
function mergeConfigs(defaultConfig, userConfig)
{
    const merged = {};
    for (const key in defaultConfig) {
        const defaults = defaultConfig[key];

        // If the key doesn't exist in the user config, fall back to the default
        if (!Object.hasOwnProperty.call(userConfig, key)) {
            merged[key] = defaults;
            continue;
        }

        let user = userConfig[key];

        if (defaults === null || typeof defaults === 'undefined') {
            merged[key] = user || null;
            continue;
        }

        if (Array.isArray(defaults)) {
            if (!Array.isArray(user)) {
                console.log('User config for', key, 'is not an array. Using default values.');
                merged[key] = defaults;
                continue;
            }

            merged[key] = [...defaults, ...user];
            // Remove duplicates
            merged[key] = [...new Set(merged[key])];
            continue;
        }

        if (typeof defaults === 'object') {
            if (typeof user !== 'object') {
                console.log('User config for', key, 'is not an object. Using default values.');
                merged[key] = defaults;
                continue;
            }

            merged[key] = mergeConfigs(defaults, user);
            continue;
        }

        // Usually a string or number
        merged[key] = user;
    }

    return merged;
}

const sortOrder = ['none', 'asc', 'desc'];

const sortDirections = {
    name: 'none',
    size: 'none',
    modified: 'none',
};

const sortIcons = {
    none: 'fa-sort',
    asc: 'fa-sort-up',
    desc: 'fa-sort-down',
};

const sortAttribute = 'data-sort';
let originalRows = [];

/**
 * Reset the sort directions for all other columns
 *
 * @param {String} currentSort
 */
function resetOtherSortDirections(currentSort)
{
    for (const key in sortDirections) {
        if (key === currentSort) {
            continue;
        }

        sortDirections[key] = 'none';
        const header = document.querySelector(`#${key}-header`);
        const icon = header.querySelector('i.sort-icon');

        if (icon) {
            icon.classList.remove('fa-sort-up', 'fa-sort-down');
            icon.classList.add('fa-sort');
        }
    }
}

/**
 * Sort the table by the clicked header
 *
 * @param {Event} event
 * @returns {void}
 */
function sortTable(event)
{
    let target = event.target;
    console.log('Target', target);

    // Re-assign to the table header if it's one of the icons
    if (target.tagName === 'I') {
        target = target.parentElement;
    }

    const sortDirectionKeys = Object.keys(sortDirections);
    const originalId = target.id;
    const id = originalId.replace('-header', '');

    if (!sortDirectionKeys.includes(id)) {
        return;
    }

    const sortIndex = target.cellIndex;
    const table = document.querySelector('#file-listing');
    let rows = Array.from(table.rows);

    // First time sorting
    if (!originalRows.length) {
        originalRows = [...rows];
    }

    const previousSort = sortDirections[id];
    const sortDirection = sortOrder[(sortOrder.indexOf(previousSort) + 1) % sortOrder.length];
    const isNumericSort = id === 'size' || id === 'modified';

    if (sortDirection === 'none') {
        rows = [... originalRows];
    }
    else {
        rows.sort((a, b) => {
            let aSort = a.cells[sortIndex].getAttribute(sortAttribute);
            let bSort = b.cells[sortIndex].getAttribute(sortAttribute);

            // Case insensitive sorting
            if (!isNumericSort) {
                aSort = aSort.toLowerCase();
                bSort = bSort.toLowerCase();
            }

            let first = aSort;
            let second = bSort;
            if (sortDirection === 'desc') {
                first = bSort;
                second = aSort;
            }

            if (isNumericSort) {
                return first - second;
            }

            return first.localeCompare(second);
        });
    }

    resetOtherSortDirections(id);

    const sortIcon = target.querySelector('i.sort-icon');
    if (sortIcon) {
        sortIcon.classList.remove('fa-sort', 'fa-sort-up', 'fa-sort-down');
        sortIcon.classList.add(sortIcons[sortDirection]);
    }

    // Update the sort direction
    sortDirections[id] = sortDirection;

    table.innerHTML = '';
    for (const row of rows) {
        table.appendChild(row);
    }
}

/**
 * Setup the sorting event listeners
 */
function setupSorting()
{
    const headers = document.querySelectorAll('th');
    for (const header of headers) {
        header.addEventListener('click', sortTable);
    }
}

/**
 * Setup the table with the autoindex data
 *
 * @param {Object} autoindexData
 * @param {Object} config
 */
function setupTable(autoindexData, config)
{
    const parentTable = document.querySelector('#main-table');
    parentTable.classList.remove('hidden');

    const table = document.querySelector('#file-listing');

    const locale = config.dateTimeLocale || navigator.language;
    const localeOptions = {
        dateStyle: 'full',
        timeStyle: 'short',
    };

    const ignoreEntries = Array.isArray(config.ignoreEntries) ? config.ignoreEntries : [];
    for (const file of autoindexData) {
        if (ignoreEntries.includes(file.name)) {
            continue;
        }

        const row = document.createElement('tr');
        const name = document.createElement('td');
        const link = document.createElement('a');
        const filename = file.name;

        name.setAttribute(sortAttribute, filename);

        link.href = filename;
        link.textContent = filename;

        /**
         * Icon in the first table cell
         */
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-fw';
        icon.classList.add(resolveFileIcon(config, file));
        icon.setAttribute('style', 'margin-right: 0.25rem;');

        link.prepend(icon);
        name.appendChild(link);

        // File size
        const size = document.createElement('td');
        size.setAttribute(sortAttribute, file.size || 0);
        size.textContent = '';
        const fileSize = file.size;
        if (fileSize) {
            size.textContent = formatBytes(file.size);
        }

        // Last modified
        const modified = document.createElement('td');
        const modifiedDate = new Date(file.mtime);
        modified.setAttribute(sortAttribute, modifiedDate.getTime());
        modified.textContent = Intl.DateTimeFormat(locale, localeOptions).format(modifiedDate);

        // Append the cells to the row
        row.appendChild(name);
        row.appendChild(size);
        row.appendChild(modified);

        // Append the row to the table
        table.appendChild(row);
    }
}

function showCredits()
{
    const credits = document.querySelector('#author-credits');
    credits.classList.remove('hidden');
}

/**
 * Initialize the autoindex page
 */
function autoIndexInit()
{
    // I mean... if this JS loaded, then JS is enabled.
    const noscriptAlert = document.querySelector('#noscript-alert');
    if (noscriptAlert) {
        noscriptAlert.remove();
    }

    const autoindexListing = document.querySelector('#autoindex-listing');
    let autoindexData = JSON.parse(autoindexListing.textContent);
    // autoindexListing.remove();

    let config = AUTOINDEX_CONFIG_DEFAULTS;
    if (AUTOINDEX_CONFIG) {
        config = mergeConfigs(AUTOINDEX_CONFIG_DEFAULTS, AUTOINDEX_CONFIG);
        console.log('Resulting config', config);
    }

    const title = document.querySelector('title');
    const heading = document.querySelector('#page-title');
    const path = document.querySelector('#index-path');
    const siteTitle = config.siteTitle || 'NGINX Autoindex';

    heading.textContent = siteTitle;
    path.textContent = parseIndexPath();
    title.textContent = `${siteTitle} - ${parseIndexPath()}`;

    setupTable(autoindexData, config);
    setupSorting();

    if (config.showCredits) {
        showCredits();
    }
}
