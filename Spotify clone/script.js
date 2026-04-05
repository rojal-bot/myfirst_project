console.log("Lets write java script")

let currentSong = new Audio();
let currFolder;
let songs;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {

    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as)

    songs = [];

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Show all the songs in the playlist
    let songUL = document.querySelector(".songlist")
    songUL.innerHTML = ""
    for (const s of songs) {
        songUL.innerHTML += `<li>
                            <img src="img/music.svg" alt="">
                            <div class="info">
                                <div>${s.replaceAll("%20", " ")} </div>
                                <div>Sejal</div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img width="20px" class="invert" src="img/play-btn.svg" alt="">
                            </div></li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        //accessing mp3
        let mp3 = e.querySelector(".info").firstElementChild.innerHTML;

        e.addEventListener("click", element => {
            playMusic(mp3)
        })
    })

        return songs
}

const playMusic = (track, pause = false) => {

    //update songs when changed so that they don't play at the same time

    //extra modifications for automatic play of first song when play button is clicked
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()

        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    let cards = document.querySelector(".cards")

    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            //Get metadata of folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()

            cards.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="img/play-btn.svg" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }

    }

    //Load a playlist for a specific card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}

async function main() {

    //Display all the albums on the main page
    displayAlbums()

    //Attach an event listener for previous,play and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play-circle.svg"
        }
    })

    previous.addEventListener("click", () => {
        if (!songs[0]) {
        }
    })

    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) > 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[index])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    //Listen for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    })


    //add listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {

        //percentage width we clicked and position of our cursor on x-axis when we click the seekbar
        // console.log(e.target.getBoundingClientRect().width, e.offsetX)

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100

        //circle movement
        document.querySelector(".circle").style.left = percent + '%';

        // time update
        currentSong.currentTime = (percent / 100) * currentSong.duration
    })


    //for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })


    //for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    })

    //volume
    isMuted = false;
    vol.addEventListener("click", () => {
        if (isMuted) {
            currentSong.muted = false
            vol.src = "img/volume.svg"
        } else {
            currentSong.muted = true
            vol.src = "img/mute.svg"
        }

        isMuted = !isMuted; //flip the state
    })

}

main()