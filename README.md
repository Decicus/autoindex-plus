# AutoIndex Plus for NGINX

## Introduction

AutoIndex Plus is an alternative to the default autoindex module of NGINX. It's intended to be a solution for those who want a different-looking type of directory listing, without having to deal with external software or XSLT stylesheets to achieve this.

This project is still work in progress. While it is functional, there are still some features that I would like to add in the future and might be some issues I've missed.

## Requirements

- NGINX with the [`autoindex`](https://nginx.org/en/docs/http/ngx_http_autoindex_module.html) and [`addition`](https://nginx.org/en/docs/http/ngx_http_addition_module.html) modules included.
    - From my experience, these are both included in the NGINX packages you get from `apt` (Debian and Ubuntu) and `yum` (Fedora, Alma etc.). Your mileage may vary.

## Limitations

- All of the logic for parsing and rendering the directory listing happens using frontend JavaScript. Browsers without JavaScript enabled will not be able to see the directory listing.
    - For my personal use case, this is a perfectly acceptable limitation. I don't expect people to be browsing with JavaScript disabled.
- `_header.html` expects all the other AutoIndex Plus files to be located under `/_autoindex` of the document root.
    - I don't think there's any good way to get around this, besides either a rewrite rule in NGINX or by editing the HTML/JS files. The latter option would have to be re-applied on every update of AutoIndex Plus.

## Installation

1. Clone this repository to your server.
2. Copy the `_autoindex` directory to the root of your website.
3. Inside the `_autoindex` directory, copy the `_autoindex-config.sample.js` to a new file: `_autoindex-config.js`
    - Optinally, you can change the configuration values in this new file to your liking.
4. Add the following to your NGINX configuration file:

```nginx
# Note that `/my/media` should be replaced with the directory you want to enable AutoIndex Plus on.
# The preceding `~` is a regex match, so it will match `/my/media/`, `/my/media/anything-here/`, `/my/media/anything-here/sub-directory/` etc.
# The trailing `(.*)/$` is a regex capture group, which will capture all directories inside `/my/media`. This is necessary to make the autoindex work properly on sub-directories.
location ~ /my/media(.*)/$ {
    autoindex on;
    autoindex_format json;
    addition_types application/json;

    add_before_body /_autoindex/_header.html;
    add_after_body /_autoindex/_footer.html;

    add_header Content-Type "text/html; charset=utf-8";
}
```

```nginx
# If you want to enable AutoIndex Plus on the root directory, you can use the following examples instead.
# This block ensures it works on the just the actual root directory.
location ~ /$ {
    autoindex on;
    autoindex_format json;
    addition_types application/json;

    add_before_body /_autoindex/_header.html;
    add_after_body /_autoindex/_footer.html;

    add_header Content-Type "text/html; charset=utf-8";
}

# This block ensures it works on all sub-directories as well, but only directories.
# From my testing, `location /` would cause some oddities with mime types on certain files (mostly text files).
# Suggestions on how to improve this are welcome.
location ~ /(.*)/$ {
    autoindex on;
    autoindex_format json;
    addition_types application/json;

    add_before_body /_autoindex/_header.html;
    add_after_body /_autoindex/_footer.html;

    add_header Content-Type "text/html; charset=utf-8";
}
```

5. Reload NGINX
    - For example: `sudo nginx -t && sudo nginx -s reload`

## Theming

> [!IMPORTANT]
> At the moment, the only way to change the theme is by editing the HTML files directly.  
> This means that every time you update AutoIndex Plus, you will need to reapply your changes.

AutoIndex Plus uses [Pico CSS](https://picocss.com/) for styling. If you wish to use a different theme, you can change the `<link>` tag in the [`_header.html`](./_autoindex/_header.html) file.

The [Pumpkin theme](https://picocss.com/docs/version-picker/pumpkin) is used by default. You can use the [Pico CSS version picker](https://picocss.com/docs/version-picker) to find a theme that you like, then replace the existing `<link>` tag with the one in the "Usage from CDN" section.

> [!TIP]
> If you know what you're doing, it's recommended to grab the corresponding theme from [jsDelivr](https://www.jsdelivr.com/package/npm/@picocss/pico?tab=files&path=css) and use [Subresource Integrity (SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to ensure the file hasn't been tampered with when loading into your page.  
> Find the corresponding `pico.<theme>.min.css` file, click on the "Copy to clipboard" icon and select "Copy HTML + SRI".

## How does this work?

NGINX supports outputting the autoindex as a JSON object.  
Normally this would quite literally just be a JSON response in your browser, but we use the addition module to put HTML/JavaScript before and 
after the JSON response, which then parses the JSON and renders the directory listing.

This is not the first project to use this method. Some inspiration was taken from [NGINdeX.io](https://github.com/EthraZa/NGINdeX.io)

## Screenshots and Demo

TODO

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
