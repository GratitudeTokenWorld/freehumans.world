"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProfileTemplate = void 0;
const generateProfileTemplate = (username, userData) => {
    const lvl = userData.level || 1;
    const xpArray = [
        2030, 2233, 2456, 2702, 2972,
        3269, 3596, 3956, 4351, 4787,
        5265, 5792, 6371, 7008, 7709,
        8480, 9328, 10261, 11287, 12415,
        13657, 15023, 16525, 18177, 19995,
        21994, 24194, 26613, 29275, 32202,
        35422, 38965, 42861, 47147, 51862,
        57048, 62753, 69028, 75931, 83524,
        91876, 101064, 111170, 122287, 134516,
        147968, 162764, 179041, 196945, 216639,
        238303, 262134, 288347, 317182, 348900,
        383790, 422169, 464386, 510825, 561907,
        618098, 679908, 747898, 822688, 904957,
        995453, 1094998, 1204498
    ]; // starts with lvl 2
    // Reset XP after each lvl and pass on extra xp instead of 0 ? or keep adding to XP? ... make tables for abilities and bonuses like from NFTs for example 50% boost xp gain from different sources, consumable / mats nfts... with XP boosts..
    // check xp after each action and depending on level, calculate if the user will have equal to or more than required XP to get to next level, add 1 to level, reset XP to 0, report any leftover XP if the action exceeds current levelup requirement.
    const template = `
<!DOCTYPE html>
<html lang="en" id="profilepage">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport"
        content="viewport-fit=cover, width=device-width, initial-scale=1, maximum-scale=1 user-scalable=0, minimal-ui">
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/site.webmanifest">
    <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <!-- Custom WebSafe Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@400;700&family=Roboto:wght@300;900&display=swap"
        rel="stylesheet">
    <meta name="robots" content="index, connect">

    <!-- << SHARED HEAD CODE: End >> -->

    <!-- << SPECIFIC HEAD CODE: Start >> -->
    <meta name="description" content="Beyond Social Media">
    <!-- Open Graph -->
    <meta property="og:title" content="FreeHumans.World" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content="Beyond Social Media" />
    <meta property="og:image" content="https://FreeHumans.World/img/biip.png" />
    <meta property="og:url" content="https://FreeHumans.World" />
    <meta property="og:site_name" content="FreeHumans.World" />

    <!-- Twitter Cards -->
    <meta name="twitter:title" content="FreeHumans.World">
    <meta name="twitter:description" content="Beyond Social Media">
    <meta name="twitter:image" content="https://FreeHumans.World/img/biip-twitter.png">
    <meta name="twitter:site" content="@Gratitude_World">
    <meta name="twitter:creator" content="@${username}_Apetrei">

    <title>@${username}</title>
    <!-- Here, for Pages we can use the full name instead. -->

    <!-- Style -->
    <link class="themeCSS" rel="stylesheet" href="/css/default-theme.css">
    <script type="module" src="/js/theme.js"></script>

    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/profile.css">
    <link rel="canonical" href="https://FreeHumans.World" />
</head>

<body class="profile">
    <div id="loader"><svg style="enable-background:new 0 0 110.1 85.7" viewBox="0 0 110.1 85.7"><path class="leftangle" d="m103.5 85-.6-.5L61 48c-1.4-1.2-2.3-3.1-2.3-5.1 0-2.1.9-3.9 2.3-5.1l41.9-36.4.7-.6c.7-.5 1.5-.7 2.3-.7 2.3 0 4.2 2 4.2 4.4v76.8c0 2.5-1.9 4.4-4.2 4.4-.9 0-1.7-.3-2.4-.7z"/><path class="rightangle" d="M4.2 85.7c-2.3 0-4.2-2-4.2-4.4V4.4C0 1.9 1.9 0 4.2 0c.9 0 1.7.3 2.3.7l.7.6 41.9 36.5c1.4 1.2 2.3 3.1 2.3 5.1 0 2.1-.9 3.9-2.3 5.1l-42 36.5-.6.5c-.6.4-1.4.7-2.3.7z"/></svg></div>
    <div class="shortMessage flex justify-start">
        <img class="XL_icon" />
        <p></p>
    </div>
    <div id="messages-container">
        <div class="messages_from">
            <!-- Add online and away status small circles with simple color -->
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
            <div id="dyablo_chat" class="flex-center justify-start">
                <div class="small_avatar" href="/${username}"><img src="/img/lucian.jpg" /></div>
                <div class="name_user">
                    <h3>Dyablo Hunter</h3>
                    <span class="user_account">@dyablo</span>
                </div>
            </div>
        </div>
        <div id="dm">
        </div>
        <div class="messages_header flex-center justify-between">
            <header class="flex-center justify-start">
                <span class="small_avatar" href="/${username}"><img src="/avatars/lucianape3.webp" /></span>
                <div class="name_bio">
                    <h3>${userData.fullname + ' @' + username}</h3>
                    <!-- Add online and away status small circles with simple color -->
                    <span class="bio">Creator of Worlds</span>
                </div>
            </header>
            <button class="close"><img class="L_icon invert-1" src="/svgs/close.svg" /></button>
        </div>
    </div>
    <div id="posting">
        <form id="posting-form">
            <div class="type flex-center">
                <input id="post_videos" type="radio" name="post-type" />
                <label for="post_videos" title="Videos"><img class="M_icon invert-2" src="/svgs/video.svg" /></label>

                <input id="post_images" type="radio" name="post-type" />
                <label for="post_images" title="Images"><img class="M_icon invert-2" src="/svgs/image.svg" /></label>

                <input id="post_audio" type="radio" name="post-type" />
                <label for="post_audio" title="Audio"><img class="M_icon invert-2" src="/svgs/music.svg" /></label>

                <input id="post_item" type="radio" name="post-type" />
                <label for="post_item" title="Selling"><img class="M_icon invert-2" src="/svgs/cart.svg" /></label>
            </div>
            <textarea placeholder="Post what now? ..."></textarea>
            <div id="buttonz" class="flex justify-between">
                <button id="cancel-posting" class="big_btn">CANCEL</button>
                <div class="postMsg">All posts are public.</div>
                <button id="post-now" class="big_btn" type="submit">SEND</button>
            </div>
        </form>
    </div>
    <style id="root_variables"></style>
    <header id="main_header">
        <div class="main-header flex justify-between">
            <div class="main-header flex justify-between">
                <div class="balances">
                    <a href="/" class="logo"><img title="Home" class="L_icon inline-block invert2"
                            src="/svgs/symbol.svg" /></a>
                    <span class="like2give-balance" title="Like2Give balance">23,000</span>
                    <span class="share2earn-balance" title="Share2Earn balance">2,300</span>
                </div>
                <div class="flex-center">
                    <button id="notifications" class="notifications" title="Notifications">23</button>
                    <div id="notifications-list">
                        <h2 class="flex-center">
                            <img class="L_icon invert1" alt="Notifications" src="/svgs/bell.svg" />
                            Notifications
                        </h2>
                        <form id="notifications_category">
                            <input id="n_posts" type="radio" name="ncat" checked />
                            <label for="n_posts">Posts</label>
                            <input id="n_comments" type="radio" name="ncat" />
                            <label for="n_comments">Comments</label>
                            <input id="n_shares" type="radio" name="ncat" />
                            <label for="n_shares">Shares</label>
                            <input id="n_likes" type="radio" name="ncat" />
                            <label for="n_likes">Likes</label>
                            <input id="n_achievements" type="radio" name="ncat" />
                            <label for="n_achievements">Achievements</label>
                        </form>
                        <ul>
                            <li>
                                <div class="flex-between w100">
                                    <div class="flex-center">
                                        <div class="flex-column">
                                            <div class="avatar-container">
                                                <img class="avatar" alt="avatar" src="/img/lucian.jpg" />
                                            </div>
                                            <b>💬</b>
                                        </div>
                                        <aside>
                                            New comment from Lucian Apetrei.
                                            <span>2 hours ago</span>
                                        </aside>
                                    </div>
                                    <div class="post-thumbnail">
                                        <img class="p-thumb" alt="Post name or title?" title="Post name or stuff"
                                            src="/content/1.jpg" />
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="flex-between w100">
                                    <div class="flex-center">
                                        <div class="flex-column">
                                            <div class="avatar-container">
                                                <img class="avatar" alt="avatar" src="/img/lucian.jpg" />
                                            </div>
                                            <b>❤️</b>
                                        </div>
                                        <aside>
                                            Lucian Apetrei liked your post.
                                            <span>1 day ago</span>
                                        </aside>
                                    </div>
                                    <div class="post-thumbnail">
                                        <img class="p-thumb" alt="Post name or title?" title="Post name or stuff"
                                            src="/content/3.jpg" />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div id="inventory" class="flex-center">
                        <bags title="🎒 NFT Inventory"></bags>
                        <slots>
                            <bag_menu>
                                <bag class="L_icon locked" title="Unlock additional space"></bag>
                                <bag class="L_icon locked" title="Unlock additional space"></bag>
                                <bag class="L_icon empty" title="Empty bag slot"></bag>
                                <bag class="L_icon rookie_bag used" title="Rookie Bag (4 slots)"></bag>
                                <!-- Rookie bag adds NFT 4 slots -->
                                <wallet class="fiat L_icon" title="fiat currency wall... 🤢 hurl!"></wallet>
                                <keychain class="L_icon" title="Backup Secret Key"></keychain>
                            </bag_menu>
                            <bags_space class="grid5">
                                <nft id="nft-123" class="equipped legendary_inner_glow"><img draggable="true"
                                        src="/img/markets/avatars64.jpg" title="Cyberpunk Avatar (In use)" /></nft>
                                <nft id="nft-124" class="unequipped"><img draggable="true"
                                        src="/img/markets/animations64.gif" title="Animation Name (Not in use)" />
                                </nft>
                                <nft id="nft-125" title="NFT slot"></nft>
                                <nft id="nft-126" title="NFT slot"></nft>
                                <nft id="nft-127" title="NFT slot"></nft>
                                <nft id="nft-128" title="NFT slot"></nft>
                                <nft id="nft-129" title="NFT slot"></nft>
                                <nft id="nft-130" title="NFT slot"></nft>
                                <nft id="nft-131" title="NFT slot"></nft>
                                <nft id="nft-132" title="NFT slot"></nft>
                                <nft id="nft-133" title="NFT slot"></nft>
                                <nft id="nft-134" title="NFT slot"></nft>
                                <nft id="nft-135" title="NFT slot"></nft>
                                <nft id="nft-136" title="NFT slot"></nft>
                                <nft id="nft-137" title="NFT slot"></nft>
                                <nft id="nft-138" title="NFT slot"></nft>
                            </bags_space>
                        </slots>
                    </div>

                    <div id="user-menu" class="flex">
                        <div class="avatar-container"><img class="avatar" title="Account" alt="avatar"
                                src="/img/lucian.jpg" />
                            <!-- WHEN you click on the avatar, you also inspect the user, his inventory shows up and the user can customize if he wants to display or hide items in his inventory from the public, in addition to the items in-use which are always publicly displayed. -->
                        </div>
                        <div id="menu-options">
                            <button id="profile" class="profile" title="Manage Profile"><img class="M_icon invert-1"
                                    alt="Manage Profile" src="/svgs/user.svg" /> <span>Profile</span></button>
                            <button id="messages" class="messages" title="Messages"><img class="M_icon invert-1"
                                    src="/svgs/chat.svg">
                                <span>Messages</span></button>
                            <button id="markets_section" class="markets_section" title="Markets"><img
                                    class="M_icon invert-1" src="/svgs/cart.svg">
                                <span>Markets</span></button>
                            <!-- Hide login button when authenticated. -->
                            <button id="login" class="login" title="Connect Account"><img class="M_icon"
                                    alt="Connect wallet - Unlocked" src="/svgs/qr.svg" /> <span>Connect
                                    wallet</span></button>
                            <button id="logout" title="Disconnect Account"><img class="M_icon"
                                    alt="Disconnect wallet - Locked" src="/svgs/locked.svg" /> Disconnect</button>
                        </div>
                    </div>
                </div>
    </header>

    <main class="maxw-690">
        <xp title="Well Rested: 200% XP Earn Rate">${userData.xp || 0} / ${xpArray[lvl - 1]} XP<p style="left: -${100 - (userData.xp / xpArray[lvl - 1] * 100)}%"></p>
        </xp>
        <div id="cover"
            style="background: url(/nft/cover/cyber-user-world-1.jpg) no-repeat 50% 50%; background-size: cover">
            <div class="monarch">
                <div class="butterfly">
                    <div class="butterfly-turn">
                        <div class="butterfly-flutter"></div>
                    </div>
                </div>

                <div class="butterfly">
                    <div class="butterfly-turn">
                        <div class="butterfly-flutter"></div>
                    </div>
                </div>

                <div class="butterfly">
                    <div class="butterfly-turn">
                        <div class="butterfly-flutter"></div>
                    </div>
                </div>
            </div>
            <img class="profile_pic" title="Play Me" src="/img/lucian.jpg" />
            <!-- <video class="profile_pic" title="Play Me" src="/content/lucianape3/video/je.mp4" autoplay loop>
            </video> -->

            <div class="circle-glow">
                <img class="img0" src="/img/circle0.png" alt="dots circle">
                <img class="img1" src="/img/circle1.png" alt="dots glowing circle">
            </div>
            <!-- These effects like circle-glow and butterfly can be NFT's, the user can set one of them if he owns it. Selecting an NFT
            loads the correct animation or effect from the server. Can also contain sound effects. -->
        </div>
        <div class="distribution-stats grid2 gap10">
            <span class="l2g" title="Unlocked"><img class="S_icon" src="/svgs/like.svg" /> 800 GRAT</span>
            <span class="s2e" title="Unlocked"><img class="S_icon" src="/svgs/share.svg" /> 200 GRAT</span>
        </div>
        <h1 class="user_name" title="Full Name"><span>${userData.fullname}</span></h1>
        <profile_title title="Title">${userData.title}</profile_title>
        <level class="levelrange${lvl < 20 ? 1 : lvl < 30 ? 2 : lvl < 40 ? 3 : lvl < 50 ? 4 : lvl < 60 ? 5 : lvl < 70 ? 6 : 1}" title="Click to inspect">Level ${lvl} <img src="/svgs/eye.svg" /></level><br>
        <button class="following ${userData.isUserConnected ? 'yes' : ''}" title="Following?"><img class="M_icon invert1" src="/svgs/bell.svg" /></button><button
            class="username" title="Copy URL">@${username}</button><button class="send" title="Send GRAT"><img class="S_icon"
                src="/svgs/gratitude-token-logo.svg" /><img class="M_icon invert1"
                src="/svgs/arrow-right.svg" /></button><a class="blockchain_balance mr0" title="Blockchain Balance"
            href="https://testnet.explorer.xprnetwork.org/account/${username}" target="_blank">${parseInt(userData.balance).toFixed(2)}</a>
        <p class="living" title="Living la vida loca in?"><img class="M_icon invert2" src="/svgs/globe.svg" /> ${userData.city}</p>
        <div class="flex-center">
            <label class="switch rel" title="Light / Dark">
                <input id="themeSwitch" type="checkbox">
                <span class="slider"></span>
            </label>
            <label title="Sound On / Off">
                <input id="soundSwitch" type="checkbox">
                <img class="M_icon" src="/svgs/sound-off.svg" />
            </label>
        </div>
        <!-- The switch is displayed only on Own profile -->

        <div id="actions" class="flex-center">
            <!-- clicking connecting makes that beep sound and rotates the :after element back to original horizontal position so we get a minus, also make an effect like circle rippling from button. aand ... for disconnecting, reverse the effect, reverse the sound and the circle effect ripples from outside to center of button and the :after element rotates back to 90deg -->
            <!-- Also, maybe create general effect for text modals, zoom from outside to inside the text like in BiiP
            protocol maybe and rotate to center - copy paste? or something like youtube notification bottom-left? -->
            <div id="send-msg" class="messages" title="Message">
                <img class="invert2" src="/svgs/chat.svg">
            </div>
            <div class="mh-10">
                <div id="connect" title="Connect">
                </div>
                <div class="blip"></div>
            </div>
            <!-- HERE WE SHOW IF THE CONNECTION IS MUTUAL OR NOT AND DISPLAY THIS by showing a 50% progress bar circle around the button -->
            <div id="block" title="Block"><img class="invert2" src="/svgs/block.svg"></div>
        </div>
        <div class="stats grid3 gap10">
            <div title="How many users are connected to me">Connections<b>230,000</b></div>
            <div title="Average monthly user reach">Reach<b>423,678</b></div>
            <div title="How often do I post on average">Frequency<b>daily</b></div>
            <div
                title="Users sharing my post in the first 24H hours (Averaged over 30 days, relative to connections, but not limited to)">
                Virality<b>23%</b></div>
            <div
                title="Users sharing my post in the first week (Averaged over 30 days, relative to connections, but not limited to)">
                Shareability<b>50%</b></div>
            <div
                title="Users engaging through likes or comments (Averaged over 30 days, relative to connections, but not limited to)">
                Engagement<b>32%</b>
            </div>
        </div>

        <h2 class="shared_board">SHARED</h2>
        <div id="navigation_buttons" class="flex-between">
            <button id="prevButton" class="prev_btn hidden" title="Previous"></button>
            <button id="nextButton" class="next_btn hidden" title="Next"></button>
        </div>
        <div id="shared_board" class="wheel">
            <a class="current" href=""><img loading="lazy" src="/content/1.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/2.png" /></a>
            <a href=""><img loading="lazy" src="/content/3.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/4.webp" /></a>
            <a href=""><img loading="lazy" src="/content/5.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/6.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/me.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/charlie.webp" /></a>
            <a href=""><img loading="lazy" src="/content/1.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/2.png" /></a>
            <a href=""><img loading="lazy" src="/content/3.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/4.webp" /></a>
            <a href=""><img loading="lazy" src="/content/5.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/6.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/me.jpg" /></a>
            <a href=""><img loading="lazy" src="/content/charlie.webp" /></a>
        </div>

        <form id="filters">

            <input id="mixed" type="radio" name="filters" />
            <label class="mixed" for="mixed" title="Mixed"><img src="/svgs/mixed.svg" /></label>

            <input id="videos" type="radio" name="filters" />
            <label class="videos" for="videos" title="Videos"><img src="/svgs/video.svg" /></label>

            <input id="images" type="radio" name="filters" />
            <label class="images" for="images" title="Images"><img src="/svgs/image.svg" /></label>

            <input id="audio" type="radio" name="filters" />
            <label class="audio" for="audio" title="Audio"><img src="/svgs/music.svg" /></label>

            <input id="text" type="radio" name="filters" />
            <label class="text" for="text" title="Text"><img src="/svgs/text.svg" /></label>

            <input id="pins" type="radio" name="filters" />
            <label class="pins" for="pins" title="Pins"><img src="/svgs/pin.svg" /></label>

            <input id="markets" type="radio" name="filters" />
            <label class="markets" for="markets" title="Markets"><img src="/svgs/cart.svg" /></label>

        </form>
        </div>
        <h2 class="content_type small_avatar">
            <img src="/avatars/lucianape3.webp" />
            MIXED CONTENT
        </h2>

        <!-- HERE'S AN INTERESTING IDEA.
        Put a 23H limit on all important actions with a visible cooldown indicator in the header or somewhere on profile... for both own account or interacting with another account (user).
        Actions like: sharing, liking, auto-repin, posting, etc. - also if this is true, you can queue these actions for how many days you want, to be executed for X number of times or infinitely, you can also queue posts, remove queued posts, shift the post hour ahead to another hour, etc -->
        <div class="posts">
  
        </div>
    </main>
    <div id="search_container">
        <form>
            <input id="searchThis" type="text" value="" placeholder="Profile Search ..." />
            <input type="submit" value="" />
        </form>
        <div class="results">
            <span>Games</span> <span>Funny</span> <span>DIY</span> <span>Health</span>
        </div>
    </div>
    <footer class="maxw-690">
        <div class="flex justify-around">
            <button id="timelineLink" class="timeline" title="Timeline"><img class="M_icon invert-1"
                    src="/svgs/timeline.svg" /></button>
            <button id="post-btn" title="Post"><img src="/svgs/plus.svg" /></button>
            <button id="search-btn" title="Search"><img class="M_icon" src="/svgs/search.svg" /></button>
        </div>
        <!-- Hide the small buttons behind the Plus, slide them out when + is clicked, if + is clicked again, it triggers the Posting Modal. -->
    </footer>

    <tooltip>
        <nft_title class="legendary">The Sword of a Thousand Truths</nft_title>
        <subtitle>Legendary One-Handed Sword</subtitle>
        <item_level class="t_yellow"><b>Item Level</b> 1000</item_level>
        <binding>Binds when aquired</binding>
        <p><b>Unique-Equipped:</b> Truthbearer's Embrace</p>
        <p><b>Damage:</b> 250-500</p>
        <p><b>Speed:</b> 2.0</p>
        <p><b>Strength:</b> +150</p>
        <p><b>Intellect:</b> +100</p>
        <p><b>Versatility:</b> +80</p>
        <p><b>Critical Strike:</b> +50</p>
        <p><b>Mastery:</b> +30</p>
        <p class="equip"><b>Equip:</b> Unveils the hidden truths, allowing the wielder to see through illusions and
            disguises.</p>
        <p class="equip"><b>Equip:</b> Reality Sunder - Your attacks have a chance to rend the fabric of reality,
            dealing additional damage and temporarily lowering magical defenses.</p>
        <p class="use"><b>Use:</b> Wisdom's Resonance - Unleash the wisdom stored within the sword, increasing your
            intellect and insight by 200% for 20 seconds.</p>
        <p class="use"><b>Made by:</b> @${username}ape3</p>
        <p class="gray">"Forged in the fires of ancient wisdom, this legendary sword reveals the truths that lie hidden.
            Wield it
            with
            caution, for the burden of knowledge is heavy, and only the worthy shall embrace its power."</p>
        <actions>
            <button class="buy btn">GRAB</button> <button class="sell btn">SELL</button>
        </actions>
        <!-- ANOTHER GENIUS IDEA FROM WOW: Item quality (established by a constant average from the constant ongoing and
                                infinite votes of the community):
                                1 Poor (gray)
                                2 Common (white)
                                3 Uncommon (green)
                                4 Rare (blue)
                                5 Epic (purple)
                                6 Legendary (orange)
                                7 Artifact (light gold)
                                8 Heirloom (The GRAT red) -->
    </tooltip>

    <button id="scrollToTopBtn"></button>

    <script src="https://unpkg.com/@proton/web-sdk@4.2.15"></script>
    <script type="module" src="/js/proton.js"></script>
    <script type="module" src="/js/main.js"></script>
    <script type="module" src="/js/profile.js"></script>
</body>

</html>
`;
    return template;
};
exports.generateProfileTemplate = generateProfileTemplate;
