// The defaults can be found in the top of the `_autoindex-functions.js` file.
const AUTOINDEX_CONFIG = {
    siteTitle: 'AutoIndex Plus',

    /**
     * File extensions. The "last" file extension in the array is used as the icon.
     * E.g. `.tar.gz` would  result in `gz` being used.
     */
    fileTypes: {
        // Individual file types
        pdf: ['pdf'],
        xlsx: ['xlsx', 'xls'],
        docx: ['docx', 'doc'],
        pptx: ['pptx', 'ppt'],
        csv: ['csv'],
        code: ['json', 'xml', 'yaml', 'yml', 'ini', 'cfg', 'conf', 'html', 'htm'],

        // Grouped file types
        archive: ['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar'],
        audio: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'wma', 'aac', 'aiff', 'ape', 'alac'],
        document: ['odt', 'ods', 'odp', 'txt', 'rtf'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tif', 'tiff', 'avif', 'heic', 'jxl'],
        text: ['log', 'md', 'markdown', 'txt'],
        video: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'mpg', 'mpeg', 'm4v'],
    },

    /**
     * Font Awesome icons. `fa-solid` is the default style.
     * @link https://fontawesome.com/search?o=r&s=solid
     */
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

    /**
     * Files and directories to ignore in the listing. This is currently a fairly simple implementation.
     * Note that this does not prevent people from finding the files if they know the URL.
     *
     * These are matched exactly against their file or directory name, ignoring preceding and trailing paths.
     * Matches are case-sensitive. `example.txt` is *NOT* the same as `EXAMPLE.txt`.
     *
     * For example: If you have a file under `notes/example.txt`, you would add `example.txt` to this list.
     * Keep in mind that any other files named `example.txt` in other directories would also be ignored.
     */
    ignoreEntries: [
        // By default we ignore the `_autoindex` directory, to prevent it from showing up in your listing. If you want to show it, just remove the line below
        '_autoindex',
    ],

    /**
     * Locale used for date and time formatting.
     * By default, the browser locale of the visitor is used.
     *
     * However you can use this option to force a specific one, such as `'en-US'` or `'nb-NO'`.
     * Unless you have very specific reasons to not do so, I recommend leaving this to the default of `null`.
     */
    dateTimeLocale: null,

    /**
     * Show credits in the footer to the git repository.
     * Disabled by default, but enabling it would be one way to support the project :)
     */
    showCredits: false,
};
