const socket = io();
const myPeer = new Peer(username, {
    host: '/',
    port: '3001'
});

myPeer.on('open', id => {
    socket.emit('join-room', id, room);
});

navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(stream => {
        addVideoStream(stream, username); 
        socket.on('user-joined', (newUsername) => {
            console.log(`${newUsername} has joined the chat`);
            setTimeout(() => createVideoStream(newUsername, stream), 1000);
        });

        myPeer.on('call', call => {
            call.answer(stream);
            call.on('stream', userStream => {
                addVideoStream(userStream, call.peer);
            });
        });
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

function addVideoStream(stream, id) {
    let existingVideo = document.querySelector(`#${id}`);
    if (existingVideo) {
        return;
    }

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.id = id;
    document.querySelector('.container').append(video);
}

function createVideoStream(username, stream) {
    const call = myPeer.call(username, stream);
    call.on('stream', userStream => {
        addVideoStream(userStream, username);
    });
    call.on('close', () => {
        socket.on('user-disconnected', name => {
            document.querySelector('.container').removeChild(document.querySelector(`#${name}`))
        })
    });
}
