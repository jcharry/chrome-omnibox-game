/*
 * background.js
 * Copyright (C) 2017 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
console.log('bcakground');

let currentLevel = 0;
let gameWindow;
let gameTab;
const iconStr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABrklEQVQ4T8XUy6tNYRjH8c8RJSaESJIkA+WWy8DEIbkkl4FkhnL5C4ykFKcopM6pE1JCKWUkEZKJuYFLLkkmyCWUlHu/07u1z26vc3Zr4pms1nrf9/v+nt/zPKtLvRiFH5iJL3iPgW9d9Xju4jaW4BveYhy21wXuL8qeYQzm4yEu1wXOxlVcwViswSJ8rQuci43oKZadwr6obgbOw05MwHP0412Fx92YgXPYhWmYij0N4DasL8ZOwuJSueV40gbaDMzyQYQxUJTx6MXPYmxuPo9lWIfVHQKj9mWAm8rhOaVih/GnQA7gKL63QBfgU0m5ofAfcDpWthzYjTND9OhC3EublD1HcBJvqqp8DRvwuwIawGm8KOsX4l/2VwHTDh9xvA0wPZgWSRaJFDE27c1LFXAiHuEsjuEDRmIzthbY56YezMVPhwJmbVW5+T5Gl/Tv4BJ+YQQO4TEuNjIZblIy/EnvOm7hNaJ+BbYUH2822zIcMHujJDOb4Z+FyTiBG+UXNsjmToA5kB7bUcYtz0xG2/gvwKTZh/TeFKwtivOXftAqsxOFS5GxbI1XSNUHxV9OXVtMQj/a2AAAAABJRU5ErkJggg==';
const game = {
    hasStarted: false,
    urlRoot: 'http://localhost:3000',
    currentLevel: 0,
    debug: true,

    constructLevels() {
        this.levels = {
            1: {path: 'index.html', correctAnswers: ['yes', 'totally', 'of course', 'absolutely', 'i can', 'i will']},
            2: {
                path: 'IGISww36wYHLOjSF187d',
                almostCorrect: ['oystercatcher', 'black skimmer', 'stork'],
                correctAnswers: ['puffin', 'puffins'],
                next: this.level2.bind(this)
            },
            3: {
                path: 'wqXgkaj1zyu77HGd9Us6',
                almostCorrect: ['france', 'faroe island', 'british isle', 'greenland', 'norway', 'canada', 'atlantic canada', 'maine', 'morocco', 'new york', 'siberia', 'alaska', 'british columbia', 'california', 'kamchatka', 'kuril island'],
                correctAnswers: ['iceland']
            },
            4: {
                path: 'tGLOL7QvJD9M7e3nR5ic',
                correctAnswers: ['reykjavik', 'reykjavík'],
                almostCorrect: ['']
            },
            5: {
                path: '4D58Bh6qwJOdOIopQ6Hm',
                next: this.level5.bind(this)
            },
            6: {
                path: 'LhZ25X7BS0wHw6QK40eV',
                answerContains: ['hella'],
                next: this.level6.bind(this)
            },
            7: {
                path: 'EbePSqcVFjX8MA61MtB0',
                next: this.level7.bind(this)
            },
            8: {
                path: '954Ng6ihyLKJ9kvY7bgg',
                next: this.level8.bind(this),
                correctAnswers: ['63.8','-20.3']
            },
            9: {
                path: '59CDNsZJ4mbaIcH10S3i',
                next: this.level9.bind(this)
            },
        }
    },

    init() {
        this.hasStarted = true;
        this.currentLevel = 1;
        this.constructLevels();

        // Open and capture window
        if (!this.gameTab) {
            chrome.windows.create({
                url: 'localhost:3000/',
                focused: true,
                top: 0,
                left: 0,
                width: 700,
                height: 800
            }, w => {
                this.gameWindow = w;
                this.gameTab = w.tabs[0];
            });
        } else {
            this.gameWindow.focus();
            this.gameTab.focus();
            chrome.tabs.update(this.gameTab.id, {url: '/index.html'});
        }
    },

    cleanup() {
        this.hasStarted = false;
        this.currentLevel = 0;
        chrome.windows.remove(this.gameWindow.id);
        this.gameWindow = null;
        this.gameTab = null;

        if (this.malfunctionInterval) {
            window.clearInterval(this.malfunctionInterval);
        }
    },

    goToNextLevel() {
        this.currentLevel++;
        if (this.levels[this.currentLevel]) {
            chrome.tabs.update(this.gameTab.id, {url: `${this.urlRoot}/${this.levels[this.currentLevel].path}.html`, selected: true});
            // Run any extra, level specific code
            if (this.levels[this.currentLevel].next) {
                this.levels[this.currentLevel].next();
            }
        } else {
            // Game Over!
            chrome.tabs.update(this.gameTab.id, {url: `${this.urlRoot}/${this.levels['end'].path}.html`, selected: true});
        }

    },

    handleInput(text) {
        console.log('input captured', text);

        if (this.levels[this.currentLevel].answerContains) {
            const contains = this.levels[this.currentLevel].answerContains;
            for (let i = 0; i < contains.length; i++) {
                let a = contains[i];
                if (text.toLowerCase().indexOf(a) !== -1) {
                    this.goToNextLevel();
                    return;
                }
            }
        }

        // Check input against current level's acceptable answers
        let answers = this.levels[this.currentLevel].correctAnswers;
        for (let i = 0; i < answers.length; i++) {
            let answer = answers[i];
            if (text.indexOf(answer) !== -1) {
                console.log('correct!');
                this.goToNextLevel();
                return;
            }
        }

        // Otherwise handle non-correct input
        let almostCorrect = this.levels[this.currentLevel].almostCorrect;
        if (almostCorrect) {
            for (let i = 0; i < almostCorrect.length; i++) {
                let answer = almostCorrect[i];
                if (answer.indexOf(text) !== -1) {
                    console.log('almost correct!');
                    // Do something to the page
                    chrome.notifications.create({
                        type: 'basic',
                        message: `Hmm, maybe. But I'm not sure ${text} is quite right.`,
                        title: 'Almost',
                        iconUrl: iconStr,
                        requireInteraction: true
                    });
                    return;
                }
            }
        }

        // If we get all the way down here, then text was entered
        // that isn't correct or almost correct,
        // Show some generic message
        chrome.notifications.create({
            type: 'basic',
            message: `No way. ${text} can't be right at all.`,
            title: 'Way off',
            iconUrl: iconStr,
            requireInteraction: true
        });
    },

    // LEVEL FUNCTIONS //
    level2: function() {
        chrome.downloads.download({ url: `${this.urlRoot}/assets/bird.jpg` });
    },
    level5: function() {
        setTimeout(() => {
            chrome.notifications.create({
                type: 'basic',
                message: 'Quick! I\'ve got something.',
                title: 'A Stroke of Luck!',
                iconUrl: iconStr,
                buttons: [{title: 'Continue'}],
                requireInteraction: true
            });
            chrome.notifications.onButtonClicked.addListener(id => {
                chrome.notifications.clear(id);
                this.goToNextLevel();
                return;
            });
        }, 500);
    },
    level6: function() {
        console.log('level6');
        setTimeout(() => {
            chrome.downloads.download({ url: `${this.urlRoot}/assets/msg.jpg` });
            chrome.notifications.create({
                type: 'basic',
                message: 'I noticed something else scratched at the bottom of the page.  I\'m sending it to you now. Maybe it\'ll be helpful in decoding the message?',
                title: 'Having any luck?',
                iconUrl: iconStr,
                requireInteraction: true
            });
        }, 3000)
    },
    level7: function() {
        setTimeout(() => {
            chrome.notifications.create({
                type: 'basic',
                message: '',
                title: 'I\'m here.',
                iconUrl: iconStr,
                buttons: [{title: 'Continue'}],
                requireInteraction: true
            });
            // chrome.notifications.onButtonClicked.addListener(e => {
            //     this.goToNextLevel();
            //     return;
            // });
        }, 5000);
    },
    level8: function() {
        chrome.downloads.download({ url: `${this.urlRoot}/assets/signpost.png` });
        // chrome.tabs.executeScript({
        //     code: 'document.body.style.backgroundColor="red"'
        // });
        let malfunctionCounter = 0;
        this.malfunctionInterval = setInterval(() => {
            malfunctionCounter++;
            if (malfunctionCounter === 3) {
                chrome.notifications.create({
                    type: 'basic',
                    message: 'Looks like my PDA is malfunctioning and it might be sending erroneous commands to you.',
                    title: 'Sorry about that',
                    iconUrl: iconStr,
                    requireInteraction: true
                });
            } else if (malfunctionCounter === 6) {
                chrome.notifications.create({
                    type: 'basic',
                    message: 'Seriously sorry, looks like I\'m driving you crazy.  I don\'t know what\'s happening.',
                    title: 'Oh man',
                    iconUrl: iconStr,
                    requireInteraction: true
                });
            }
            let seed = Math.random();
            // if (seed < 0.3) {
            //     // Scramble text
            //     chrome.tabs.executeScript(null, {file: "scramble.js"});
            if (seed < 0.6){
                //pop up some random widows
                for (let i = 0; i < 3; i++) {
                    chrome.windows.create({
                        left: Math.floor(Math.random() * 500),
                        top: Math.floor(Math.random() * 500),
                        width: 60,
                        height: 60
                    });
                }
            } else {
                // move windows around
                chrome.windows.getAll(windows => {
                    windows.forEach(w => {
                        chrome.windows.update(w.id, {
                            left: Math.floor(Math.random() * 500),
                            top: Math.floor(Math.random() * 500),
                            width: Math.floor(Math.random() * 200 + 400),
                            height: Math.floor(Math.random() * 300 + 300)
                        });
                    });
                });
            }
        }, 15000)
    },
    level9: function() {
        if (this.malfunctionInterval) {
            window.clearInterval(this.malfunctionInterval);
        }

    },
    endLevel: function() {

    }
};

// Globally listen to omnibox
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    let suggestions = [{content: `are you sure you want to ${text}`, description:  `are you sure you want to ${text}`}];
    // Set default suggestion
    chrome.omnibox.setDefaultSuggestion({description:suggestions[0].description});
    suggest([]);
});

chrome.omnibox.onInputEntered.addListener(text => {

    let input = text.toLowerCase();

    // For debugging
    if (game.debug === true) {
        if (input === 'level') {
            console.info('current level', game.currentLevel);
            return;
        }

        if (input === 'answers') {
            console.info('answers', game.levels[game.currentLevel].correctAnswers);
            return;
        }
    }

    console.log('input text', input);
    if (input === 'reset' || input === 'restart') {
        game.cleanup();
        return;
    }

    if (input === 'start' && game.currentLevel === 0) {
        if (!game.hasStarted) {
            console.log('init');
            game.init();
            return;
        }  else {
            // TODO: Handle reset case
            alert('are you sure you want to start over?');
            if (game.hasStarted) {
                game.cleanup()
            }
        }
    } else if (input === 'start') {
        if (game.hasStarted) {
            game.cleanup()
            game.init();
        }
    }

    if (input !== '') {
        game.handleInput(input);
        return;
    }
});

const filter = {urls: ['*://*.google.com/maps*']}

let googleMapsNotification = false;
chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    console.log('went to maps');
    if (!googleMapsNotification) {
        googleMapsNotification = true;
        chrome.notifications.create({
            type: 'basic',
            message: `A map! Great idea! Do we know enough for it be helpful, though?`,
            title: 'Amazing',
            iconUrl: iconStr,
            requireInteraction: true
        });
    }
}, filter);
