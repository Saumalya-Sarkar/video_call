const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.set('view engine', 'ejs')
app.use(express.static(__dirname+'/views/'))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.get('/:id', (req, res) => {
    res.render('videoPage.ejs', { id: req.params.id , name: req.query.name })
})

app.post('/', (req, res) => {
    const { name, room } = req.body
    res.redirect(`/${room}?name=${name}`)
})

http.listen(3000, () => console.log('running on port 3000'))

io.on('connection', socket => {
    socket.on('join-room', (name, room) => {
        console.log(`${name} connected in room ${room}`)
        socket.join(room)
        socket.broadcast.to(room).emit('user-joined', name)
        socket.on('disconnect', () => {
            socket.broadcast.to(room).emit('user-disconnected', name)
        })
    })
})