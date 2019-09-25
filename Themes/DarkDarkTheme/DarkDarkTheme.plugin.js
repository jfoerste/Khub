//META{"name":"DarkDarkTheme","displayName":"DarkDarkTheme","website":"https://khub.kyza.gq/?plugin=DarkDarkTheme","source":"https://raw.githubusercontent.com/KyzaGitHub/Khub/master/Plugins/DarkDarkTheme/DarkDarkTheme.plugin.js"}*//

/*@cc_on
@if (@_jscript)

// Offer to self-install for clueless users that try to run this directly.
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
var pathSelf = WScript.ScriptFullName;
// Put the user at ease by addressing them in the first person
shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
  shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
  shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
  fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
  // Show the user where to put plugins in the future
  shell.Exec("explorer " + pathPlugins);
  shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();

@else@*/

String.prototype.replaceAll = function(find, replace) {
  var str = this;
  return str.replace(
    new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"),
    replace
  );
};

var DarkDarkTheme = (() => {
  const config = {
    info: {
      name: "DarkDarkTheme",
      authors: [{
        name: "Kyza",
        discord_id: "220584715265114113",
        github_username: "KyzaGitHub"
      }],
      version: "3.0.2",
      description: "DarkDarkTheme v3. A theme in plugin form.",
      github: "https://github.com/KyzaGitHub/Khub/tree/master/Plugins/DarkDarkTheme",
      github_raw: "https://raw.githubusercontent.com/KyzaGitHub/Khub/master/Plugins/DarkDarkTheme/DarkDarkTheme.plugin.js"
    },
    changelog: [
      // {
      //   "title": "New Stuff",
      //   "items": ["Removed the Revenge Ping button."]
      // }
      // ,
      // {
      //   title: "Bugs Squashed",
      //   type: "fixed",
      //   items: [
      //     "The ghostping panel now shows up correctly on macOS and Linux."
      //   ]
      // },
      // {
      //   title: "Improvements",
      //   type: "improved",
      //   items: [
      //     "Moved the icon to the top right.",
      //     "Added an animation to the ghostping panel."
      //   ]
      // }
      //	,
      // {
      //   "title": "On-going",
      //   "type": "progress",
      //   "items": []
      // }
    ],
    main: "index.js"
  };

  return !global.ZeresPluginLibrary ?
    class {
      constructor() {
        this._config = config;
      }
      getName() {
        return config.info.name;
      }
      getAuthor() {
        return config.info.authors.map((a) => a.name).join(", ");
      }
      getDescription() {
        return config.info.description;
      }
      getVersion() {
        return config.info.version;
      }
      load() {
        if (!window.ZLibrary || !window.KSSLibrary) {
          BdApi.showConfirmationModal("Libraries Required",
            [
              `By clicking "I Agree", you agree to allow ${config.info.name} to download the two libraries `,
              BdApi.React.createElement("a", {
                href: "https://github.com/rauenzi/BDPluginLibrary/",
                target: "_blank"
              }, "ZeresPluginLibrary"),
              " and ",
              BdApi.React.createElement("a", {
                href: "https://github.com/KyzaGitHub/Khub/tree/master/Libraries/KSS",
                target: "_blank"
              }, "KSS"),
              "."
            ], {
              danger: false,
              confirmText: "I Agree",
              cancelText: "No! Disable this plugin!",
              onConfirm: () => {
                // Install ZLibrary first.
                require("request").get(
                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                  async (error, response, body) => {
                    if (error)
                      return require("electron").shell.openExternal(
                        "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                      );
                    await new Promise((r) =>
                      require("fs").writeFile(
                        require("path").join(
                          ContentManager.pluginsFolder,
                          "0PluginLibrary.plugin.js"
                        ),
                        body,
                        r
                      )
                    );
                    // Install KSS last.
                    require("request").get(
                      "https://raw.githubusercontent.com/KyzaGitHub/Khub/master/Libraries/KSS/KSSLibrary.plugin.js",
                      async (error, response, body) => {
                        if (error)
                          return require("electron").shell.openExternal(
                            "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/KyzaGitHub/Khub/master/Libraries/KSS/KSSLibrary.plugin.js"
                          );
                        await new Promise((r) =>
                          require("fs").writeFile(
                            require("path").join(
                              ContentManager.pluginsFolder,
                              "KSSLibrary.plugin.js"
                            ),
                            body,
                            r
                          )
                        );
                        // Doing this because it won't work unless it is reoladed.
                        pluginModule.reloadPlugin(this.getName());
                      }
                    );
                  }
                );
              },
              onCancel: () => {
                pluginModule.disablePlugin(this.getName());
              }
            }
          );
        }
      }
      start() {}
      stop() {}
    } :
    (([Plugin, Api]) => {
      const plugin = (Plugin, Api) => {
        const {
          Patcher,
          PluginUpdater
        } = Api;

        var KSS = null;

        return class DarkDarkTheme extends Plugin {
          onStart() {
            PluginUpdater.checkForUpdate(
              "DarkDarkTheme",
              this.getVersion(),
              "https://raw.githubusercontent.com/KyzaGitHub/Khub/master/Themes/DarkDarkTheme/DarkDarkTheme.plugin.js"
            );

            KSS = new KSSLibrary(this.getName());

            this.patch();
            this.updateCSS();
          }

          onStop() {
            this.unpatch();
            this.removeCSS();
          }

          observer({
            addedNodes
          }) {
            if (KSS) {
              for (const node of addedNodes) {
                if (node.className == KSS.getSelector("chat")) {}
              }
            }
          }

          patch() {

          }

          unpatch() {
            Patcher.unpatchAll();
          }

          updateCSS() {
            // Later in onStart().
            KSS.setModule("colors", `
/* START: Variables */
/* Theme Variables */
* {
  --dark-1: #070707;
  --dark0: #0d0d0d;
  --dark1: #111;
  --dark2: #131313;
  --dark3: #161616;
  --dark4: #1a1a1a;
  --dark5: #1f1f1f;
  --dark6: #222;
  --dark7: #2a2a2a;
  --dark-blue: #53639e;
  --dark-green: #30825d;
  --dark-yellow: #b58900;
  --dark-orange: #cb4b16;
  --dark-red: #c63f3f;
}

/* Dark Theme Variables */
.theme-dark {
  --header-primary: #ccc;
  --header-secondary: #b9bbbe;
  --text-normal: #aaa;
  --text-muted: #72767d;
  --text-link: #00b0f4;
  --channels-default: #8e9297;
  --interactive-normal: #aaa;
  --interactive-hover: #bbb;
  --interactive-active: #ccc;
  --interactive-muted: #4f545c;
  --background-primary: var(--dark4);
  --background-secondary: var(--dark3);
  --background-tertiary: var(--dark1);
  --background-accent: var(--dark7);
  --background-floating: var(--dark1);
  --background-modifier-hover: rgba(79, 84, 92, 0.16);
  --background-modifier-active: rgba(79, 84, 92, 0.24);
  --background-modifier-selected: rgba(79, 84, 92, 0.32);
  --background-modifier-accent: hsla(0, 0%, 100%, 0.06);
  --elevation-low: 0 1px 0 rgba(4, 4, 5, 0.2), 0 1.5px 0 rgba(6, 6, 7, 0.05),
    0 2px 0 rgba(4, 4, 5, 0.05);
  --elevation-high: 0 8px 16px rgba(0, 0, 0, 0.24);
  --guild-header-text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
  --channeltextarea-background: var(--dark2);
  --activity-card-background: var(--dark2);
  --deprecated-panel-background: var(--dark2);
  --deprecated-card-bg: rgba(32, 34, 37, 0.6);
  --deprecated-card-editable-bg: rgba(32, 34, 37, 0.3);
  --deprecated-store-bg: var(--dark4);
  --deprecated-quickswitcher-input-background: var(--dark1);
  --deprecated-quickswitcher-input-placeholder: hsla(0, 0%, 100%, 0.3);
  --deprecated-text-input-bg: rgba(0, 0, 0, 0.1);
  --deprecated-text-input-border: rgba(0, 0, 0, 0.3);
  --deprecated-text-input-border-hover: #040405;
  --deprecated-text-input-border-disabled: #202225;
  --deprecated-text-input-prefix: #dcddde;
}
/* STOP: Variables */



/* START: Branding */
/* Titlebar */
.platform-win |titleBar|:after {
  content: "v${this.getVersion()} by Kyza#9994" !important;
  font-size: 14px !important;
  color: #999 !important;
  text-align: center !important;
  width: 100% !important;
}

/* Remove Workmark */
svg[name="DiscordWordmark"] {
  width: 250%;
  transform: scale(0.9);
  background-image: url("https://raw.githubusercontent.com/KyzaGitHub/Khub/master/Themes/DarkDarkTheme/DarkDarkThemeLogo.png");
  background-size: contain;
  background-position: left;
  background-repeat: no-repeat;
}

svg[name="DiscordWordmark"] > path {
  display: none;
}
/* STOP: Branding */



/* START: Scrollbars */
.theme-dark #app-mount ::-webkit-scrollbar-track-piece {
  border-radius: 0px;
  background-color: transparent !important;
  border-color: transparent !important;
}

.theme-dark #app-mount ::-webkit-scrollbar-track {
  border-radius: 0px;
  background-color: transparent !important;
  border-color: transparent !important;
}

.theme-dark #app-mount ::-webkit-scrollbar-thumb {
  background-color: #2a2a2a !important;
  border-color: transparent !important;
}
/* STOP: Scrollbars */



/* START: Titlebars */
/* Main Titlebar */
.theme-dark #app-mount {
  background-color: var(--dark0);
}

/* Server Titlebar */
.theme-dark |serverTitle| {
  background-color: var(--dark2);
}

/* Channel Titlebar */
.theme-dark |channelTitle| {
  background-color: var(--dark2) !important;
}

/* Search Bar */
.theme-dark |searchBar| {
  background-color: var(--dark1);
}
/* STOP: Titlebars */



/* START: Chat Box */
/* Autocomplete Above Textarea */
.theme-dark |autocomplete| {
  background-color: var(--dark2);
}

/* Autocomplete Selected */
.theme-dark |autocompleteRow| |autocompleteSelectorSelected| {
  background-color: var(--dark4);
}
/* STOP: Chat Box */



/* START: Emoji Picker */
/* Top Tabs */
/* Fixing BD's screwed up CSS. */
.theme-dark #bda-qem button {
  margin: 0px !important;
  box-shadow: none;
  border: 1px solid hsla(0, 0%, 74.9%, 0.2);
}

.theme-dark #bda-qem {
  border: none !important;
  padding: 0px !important;
}

.theme-dark #bda-qem,
.theme-dark #bda-qem > * {
  background-color: var(--dark2) !important;
  color: var(--header-primary) !important;
}

/* Main Panel */
.theme-dark |emojiPicker| {
  background-color: var(--dark3);
}

/* Frequently Used */
.theme-dark |category| {
  background-color: var(--dark3);
}

/* Search Bar */
.theme-dark |emojiSearchBar| {
  background-color: var(--dark4);
}

/* Twitch Panel */
.theme-dark #bda-qem-twitch-container {
  background-color: var(--dark3);
}

/* Favorite Panel */
.theme-dark #bda-qem-favourite-container {
  background-color: var(--dark3);
}

.theme-dark |emojiItem||emojiItemSelected| {
  background-color: var(--dark7) !important;
}

.theme-dark |categories| |emojiItemItem| {
  filter: brightness(60%);
}
/* STOP: Emoji Picker */



/* START: Ping Menu */
/* Ping Menu Top */
.theme-dark .header-ykumBX.header-2Kf7Yu.header-3LXPrb {
  background-color: var(--dark2);
}

/* Ping Menu Middle */
.theme-dark .messagesPopout-24nkyi {
  background-color: var(--dark4) !important;
}

/* Ping Menu Jump Button */
.jumpButton-3DTcS_ {
  background-color: var(--dark6) !important;
}

/* Ping Menu Bottom */
.theme-dark .messagesPopoutWrap-1MQ1bW > div:nth-child(3) {
  background-color: var(--dark2);
}

/* Ping Menu Message */
.theme-dark .messageGroupWrapper-o-Zw7G {
  background-color: var(--dark4);
  border-color: var(--dark1);
}
/* STOP: Ping Menu */



/* START: Search */
/* Search Menu */
.theme-dark .resultsWrapper-hoiXCY {
  background-color: var(--dark3);
}

/* Search Menu Back */
.theme-dark
  .searchResultsWrap-2DKFzt
  .scrollerWrap-2lJEkd.firefoxFixScrollFlex-cnI2ix.scrollerThemed-2oenus.themeGhost-28MSn0.scrollerTrack-1ZIpsv {
  background-color: var(--dark3);
}

/* Search Channel Name */
.theme-dark .channelSeparator-1X1FuH,
.channelName-1QajIf {
  background-color: var(--dark3) !important;
}

.theme-dark .div-1QajIf {
  background-color: var(--dark2);
}

/* Search Channel Separator */
.theme-dark .channelSeparator-1X1FuH {
  background-color: #2f3136;
}

/* Search Results Info */
.theme-dark .searchHeader-1l-wpR {
  background-color: var(--dark1);
}

/* Highlighted Search Result */
.theme-dark .searchResultMessage-2VxO12.hit-NLlWXA {
  background-color: var(--dark5) !important;
  border-color: var(--dark1);
}

/* Expanded Search Result */
.theme-dark .searchResult-3pzFAB.expanded-v2Szsz {
  border-color: var(--dark1);
}

/* Search Result Gradients 1 */
.theme-dark .searchResult-3pzFAB:before,
.theme-dark .searchResult-3pzFAB:after {
  display: none;
}

/* Search Result Gradients 2 */
.theme-dark
  .searchResult-3pzFAB.expanded-v2Szsz
  .searchResultMessage-2VxO12.hit-NLlWXA {
  border-top: 2px solid rgba(28, 36, 43, 0.6);
  border-bottom: 2px solid rgba(28, 36, 43, 0.6);
  box-sizing: border-box;
  background-color: rgb(54, 57, 63);
}

/* Search Result Gradients 3 */
.theme-dark .searchResults-2J8dju .searchResultMessage-2VxO12.hit-NLlWXA {
  -webkit-box-shadow: 0px 0px 10px var(--dark-1);
}

/* Search Dropdown */
.theme-dark .container-3ayLPN.elevationBorderHigh-2WYJ09 {
  background-color: var(--dark2);
  border-color: var(--dark5);
  border-width: 2px;
  border-style: solid;
}

.theme-dark .option-96V44q.searchOption-zQ-1l6::after,
.option-96V44q::after {
  display: none;
}
/* STOP: Search */



/* START: Pin Menu */
/* Pin Menu Top */
.theme-dark .header-ykumBX.header-2Kf7Yu {
  background-color: var(--dark2);
}
/* STOP: Pin Menu */



/* START: Sliders */
/* Slider Off */
.theme-dark .valueUnchecked-2lU_20 {
  background-color: var(--dark1);
}

/* Slider On Blue */
.theme-dark .valueChecked-m-4IJZ,
.theme-dark .ui-switch.checked {
  background-color: var(--dark-blue) !important;
}

/* Slider On Green */
.theme-dark .valueChecked-m-4IJZ.themeDefault-24hCdX {
  background-color: var(--dark-green) !important;
}

/* BetterDiscord Slider Off */
.theme-dark .ui-switch:not(.checked) {
  background-color: var(--dark1) !important;
}
/* STOP: Sliders */



/* START Nitro Boost Menu */
/* Nitro Main */
.theme-dark .applicationStore-1pNvnv {
  background-color: var(--dark3);
}

/* Nitro Tier */
.theme-dark .tier1Banner-1B_WXY {
  background-color: var(--dark3) !important;
}

/* Nitro Top */
.theme-dark
  .flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignCenter-1dQNNs.noWrap-3jynv6.header-2tA9Os {
  background-color: var(--dark1);
}

/* Nitro Center */
.theme-dark
  .scroller-2FKFPG.firefoxFixScrollFlex-cnI2ix.systemPad-3UxEGl.inner-ZyuQk0.content-2qfHzC {
  background-color: var(--dark5);
}

/* Nitro Bottom */
.theme-dark
  .flex-1xMQg5.flex-1O1GKY.horizontalReverse-2eTKWD.horizontalReverse-3tRjY7.flex-1O1GKY.directionRowReverse-m8IjIq.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.footer-3rDWdC.footer-1o3nCu {
  background-color: var(--dark3);
}

/* Boosting Tiers */
.theme-dark .tierNoneContainer-3hhK3h {
  background-color: var(--dark5);
}

.theme-dark .tierHeader---JJFb {
  background-color: var(--dark3);
}

.theme-dark .tierBody-16Chc9 {
  background-color: var(--dark5);
}

.theme-dark .tierNoneText-2OvCv7 {
  font-size: 0px;
}

.theme-dark .tierNoneText-2OvCv7:before {
  content: "Boost my server or die";
  font-size: 14px;
}

.theme-dark .tierNoneText-2OvCv7:after {
  content: "https://kyza.gq/discord/";
  font-size: 14px;
}

.theme-dark .carouselLeftGradientEdge-3P4spl {
  background-image: linear-gradient(90deg, var(--dark1), rgba(54, 57, 63, 0));
}

.theme-dark .carouselRightGradientEdge-2Z3H8D {
  background-image: linear-gradient(-90deg, var(--dark1), rgba(54, 57, 63, 0));
}
/* STOP: Nitro Boost Menu */



/* START: Popups */
/* Channel Popup */
.theme-dark .modal-yWgWj-.modal-1sor29 {
  background-color: var(--dark4);
}
/* STOP: Popups */



/* START: Rich Presence */
/* Full Profile Top No Activity */
.theme-dark .topSectionNormal-2-vo2m {
  background-color: var(--dark1);
}

/* Full Profile Top Activity 1 */
.theme-dark .topSectionPlaying-1J5E4n {
  background-color: #36363f;
}

/* Full Profile Top Activity 2 */
.theme-dark .topSectionPlaying-1J5E4n {
  background-color: #26262f;
}

/* Full Profile Bottom */
.theme-dark .body-3ND3kc {
  background-color: var(--dark3);
}

/* Full Profile Spotify */
.theme-dark .topSectionSpotify-1lI0-P {
  background-color: #363f36;
}

.theme-dark
  .topSectionSpotify-1lI0-P
  .actionButton-3W1xZa.button-38aScr.lookInverted-2D7oAl.colorGreen-29iAKY.sizeSmall-2cSMqn.grow-q77ONN {
  background-color: #eee;
}

/* Mini Profile Top Shade */
.theme-dark .activityUserPopout-2yItg2.activity-11LB_k {
  background-color: rgba(0, 0, 0, 0.3);
}

/* Mini Profile Top Activity  */
.theme-dark .headerPlaying-j0WQBV.header-2BwW8b.size16-14cGz5 {
  background-color: #36363f;
}

/* Mini Profile Top Spotify */
.theme-dark .headerSpotify-zpWxgT.header-2BwW8b.size16-14cGz5 {
  background-color: #363f36;
}

/* Mini Profile Main */
.theme-dark .bodyInner-245q0L {
  background-color: #1a1a1a !important;
}

/* Mini Profile Bottom */
.theme-dark .footer-1fjuF6 {
  background-color: var(--dark3);
}

/* Mini Profile Chat */
.theme-dark .footer-1fjuF6 > input {
  background-color: var(--dark1);
}
/* STOP: Rich Presence */



/* START: Discover/Activity Tab */
.theme-dark .searchBox-3Y2Vi7.searchBoxInput-uJ66lD {
  background-color: var(--dark7);
}

.theme-dark .popoutContainer-3WC9HR.homepage-28Bghb.homepage-nMy8gk:hover {
  background-color: var(--dark5);
}

/* Activity Games */
.theme-dark .section-2VKIPC {
  background-color: var(--dark5);
}

/* Activity Recently Played */
.theme-dark .card-GqTca8.recentlyPlayedContainer-2F3MqS {
  background-color: var(--dark2);
}
/* STOP: Discover/Activity Tab */



/* START: Library Tab */
/* Top Buttons */
.theme-dark
  .actionButton-4w4-EY.button-38aScr.lookFilled-1Gx00P.colorPrimary-3b3xI6.sizeIcon-1-kvKI.grow-q77ONN {
  background-color: var(--dark5);
}

/* Action Buttons */
.theme-dark
  .button-38aScr.lookFilled-1Gx00P.colorPrimary-3b3xI6.hoverGreen-1gjdJc.actionButtonSize-1Znp1q.grow-q77ONN.hasHover-3X1-zV {
  background-color: var(--dark7);
}

/* Gift Inventory */
.theme-dark
  .scroller-2FKFPG.firefoxFixScrollFlex-cnI2ix.scrollerStore-390omS.systemPad-3UxEGl {
  background-color: var(--dark4);
  padding-left: 20px;
  padding-right: 20px;
}
/* STOP: Library Tab */



/* START: Friends Tab */
.theme-dark .friendsTable-133bsv {
  background-color: var(--dark4);
  margin-top: 0px;
}

.theme-dark .container-1r6BKw.themed-ANHk51 {
  background-color: var(--dark1);
}
/* STOP: Friends Tab */



/* START: Server Folders */
.theme-dark .expandedFolderBackground-2sPsd- {
  background-color: var(--dark6);
}
/* STOP: Server Folders */



/* START: Delete Message Dialog */
/* Center */
.theme-dark .modal-yWgWj-.container-SaXBYZ.sizeSmall-1jtLQy {
  background-color: var(--dark4);
}

/* Message */
.theme-dark .modal-yWgWj-.container-SaXBYZ.sizeSmall-1jtLQy .message-2qRu38 {
  background-color: var(--dark3);
}

/* Footer */
.theme-dark .modal-yWgWj-.container-SaXBYZ.sizeSmall-1jtLQy .footer-3rDWdC {
  background-color: var(--dark2);
}
/* STOP: Delete Message Dialog */



/* START: Add Friends To Group */
.theme-dark .modal-yWgWj-.popout-103y-5.sizeSmall-1jtLQy {
  background-color: var(--dark1);
}
/* STOP: Add Friends To Group */



/* START: User Panel */
.theme-dark .container-1giJp5 {
  background-color: var(--dark2);
}

.theme-dark .panels-j1Uci_ {
  background-color: transparent;
}

.theme-dark .container-3baos1 {
  background-color: var(--dark2);
}
/* STOP: User Panel */



/* START: Date Picker */
.calendarPicker-2yf6Ci,
.react-datepicker,
.react-datepicker__header {
  background-color: var(--dark5) !important;
}

.react-datepicker__day,
.react-datepicker__navigation {
  background-color: var(--dark7) !important;
}
/* STOP: Date Picker */



/* START: Settings Modals */
.scroller-2FKFPG.firefoxFixScrollFlex-cnI2ix.systemPad-3UxEGl.inner-ZyuQk0 {
  padding-top: 20px;
  background-color: var(--dark4);
}

.footer-3rDWdC {
  background-color: var(--dark3) !important;
}
/* STOP: Settings Modals */



/* START: Controls */
/* Dropdown Selected */
.css-12o7ek3-option {
  background-color: var(--dark2);
}

/* Dropdown Unselected */
.css-1aymab5-option {
  background-color: var(--dark3);
}

/* Dropdown Hovered */
.css-1gnr91b-option {
  background-color: var(--dark4);
}

/* Buttons */
.lookFilled-1Gx00P.colorBrand-3pXr91 {
  background-color: transparent;
  border: 1px solid var(--dark-blue);
}

.lookFilled-1Gx00P.colorGreen-29iAKY {
}

/* Slider */
.barFill-23-gu- {
  background-color: var(--dark-blue);
}

/* Microphone Slider */
[style*="background: rgb(105, 196, 154);"] {
  background-color: var(--dark-green) !important;
}

.sliderBar-3DezvM.microphone-2rtdHw .barFill-23-gu- {
  background-color: var(--dark-yellow) !important;
  filter: brighten(-0.1);
}

.sliderBar-3DezvM.microphone-2rtdHw .grow {
  background-color: var(--dark-yellow) !important;
}

/* Large Checkboxes */
/* Check Mark */
.checkbox-1ix_J3.checked-3_4uQ9 {
  background-color: var(--dark7);
}

/* Blue */
.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(114, 137, 218)"] {
  background: transparent !important;
  border-color: var(--dark-blue) !important;
  transition-duration: 0.4s;
}

.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(114, 137, 218)"]:hover {
  background-color: var(--dark-blue) !important;
}

/* Green */
.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(67, 181, 129)"] {
  background: transparent !important;
  border-color: var(--dark-green) !important;
  transition-duration: 0.4s;
}

.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(67, 181, 129)"]:hover {
  background-color: var(--dark-green) !important;
}

/* Yellow */
.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(250, 166, 26)"] {
  background: transparent !important;
  border-color: var(--dark-yellow) !important;
  transition-duration: 0.4s;
}

.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(250, 166, 26)"]:hover {
  background-color: var(--dark-yellow) !important;
}

/* Orange */
.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(245, 119, 49)"] {
  background: transparent !important;
  border-color: var(--dark-orange) !important;
  transition-duration: 0.4s;
}

.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(245, 119, 49)"]:hover {
  background-color: var(--dark-orange) !important;
}

/* Red */
.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(240, 71, 71)"] {
  background: transparent !important;
  border-color: var(--dark-red) !important;
  transition-duration: 0.4s;
}

.cardPrimaryEditable-3KtE4g.card-3Qj_Yx[style*="background-color: rgb(240, 71, 71)"]:hover {
  background-color: var(--dark-red) !important;
}
/* STOP: Controls */



/* START: Settings */
.activeGame-14JI7o.notDetected-33MY4s {
  background-color: var(--dark2);
}

/* Search Games */
.searchBox-3Y2Vi7.search-MFQ5bU {
  background-color: var(--dark2);
}
/* STOP: Settings */



/* START: BetterDiscord */
.theme-dark .inner-3ErfOT {
  background-color: var(--dark6) !important;
}



/* START: SafeEmbedGenerator */
.theme-dark #embedPopupWrapper {
  background-color: var(--dark2) !important;
}

.theme-dark #embedPreviewWrapper,
.theme-dark #providerName,
.theme-dark #providerUrl,
.theme-dark #authorName,
.theme-dark #authorUrl,
.theme-dark #description,
.theme-dark #imageUrl,
.theme-dark #colorPicker,
.theme-dark #embedPopupWrapper > input[type="button"]:nth-child(9) {
  background-color: var(--dark4) !important;
  color: white !important;
}
/* STOP: SafeEmbedGenerator */



/* START: dateViewer */
#dv-mount {
  background-color: transparent !important;
}
/* STOP: dateViewer */



/* START: MemberCount */
#MemberCount {
  background-color: transparent !important;
}
/* STOP: dateViewer */
/* STOP: BetterDiscord */
              `.trim(), true);
          }

          removeCSS() {
            KSS.disableModule("colors");
          }
        };
      };
      return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
