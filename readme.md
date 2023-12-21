# Gelbooru Batch Upload Tools
Hurr durr

## Usage
**On Firefox browsers, you might need to enable access to `twitter.com`, `gelbooru.com` and `corsproxy.io` in addon settings under "Permissions" tab after installing the addon**

### Collecting pictures from Twitter
Navigate to user's page, then open "Media" tab. White round button should appear in top right corner of the page. Once pressed, it will save all currently displayed pictures into the pocket until it reaches the end of the page or until it is stopped by being clicked again. Collected pictures will be available in pocket that is displayed in Gelbooru upload dialog and your browser's extension settings page.

## Build instructions
```
git clone https://github.com/MilesVII/gelbooru-upload-tools.git
cd gelbooru-upload-tools
npm i
npm run build
```

Extension package is under `dist/` directory.

## Links
[Topic on Gelbooru forum](https://gelbooru.com/index.php?page=forum&s=view&id=6695&pid=0)

[addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/gelbooru-batch-upload-tools/)

**On Firefox browsers, you might need to enable access to `twitter.com`, `gelbooru.com` and `corsproxy.io` in addon settings under "Permissions" tab after installing the addon**

## License
Shared under WTFPL license.
