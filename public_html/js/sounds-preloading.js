const defaultFiles = ['click', 'powerup', 'powerup-reverse', 'message', 'message-reverse', 'inspect', 'bell', 'like', 'drawer', 'drawer-reverse', 'swing', 'sword-swing', 'whoosh', 'bamboo-swing', 'dark', 'light', 'post', 'send', 'search', 'filter', 'okay', 'biip', 'funky-radar', 'low-blip', 'low-blip-reverse', 'bag-search', 'money-bag-shake', 'velcro', 'keychain', 'wachaa', 'bag-drop', 'inventory']

export const defaultSounds = ((username, files, dir) => {
    // username - that owns the sounds
    // nft - ID or link
    // dir - is directory location, is it in the user root folder or deeper
    // files - are basically all filenames and their extensions
    const filesArray = files || defaultFiles;

    let soundOn
    localStorage.getItem('sound') === '1' ? soundOn = true : soundOn = false

    if (soundOn) {
        let sounds = []
        let haveDir
        dir ? haveDir = dir + '/' : haveDir = '';

        filesArray.forEach(el => {
            sounds.push(new Audio(`/sounds/${username}/${haveDir}${el}.mp3`));
        })

        return sounds
    } else {
        return null
    }

})