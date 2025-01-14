import fetch from 'node-fetch'
import NodeMediaServer from 'node-media-server'
import config from './config'
import createPlaylist from './playlist'
import thumbnails, { createInitialThumbnail } from './thumbnails'

main()

function main() {
  const nms = new NodeMediaServer(config)

  nms.on(
    'prePublish',
    (sessionId: string, streamPath: string, { key }: any) => {
      if (streamPath.includes('hls_')) return
      const username = parseStreamName(streamPath)
      const session = nms.getSession(sessionId)
      if (!username || !key) return session.reject()
      fetch('http://api:5000/api/live', {
        body: JSON.stringify({
          username,
          key,
          live: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
        .then(res => {
          if (!res.ok) return session.reject()
        })
        .catch(err => {
          console.error(err)
          session.reject()
        })
    }
  )

  nms.on('postPublish', (sessionId: string, streamPath: string) => {
    if (streamPath.indexOf('hls_') === -1) return
    const name = streamPath.split('/').pop()
    createPlaylist(name!).catch(console.error)
    setTimeout(() => createInitialThumbnail(name!), 10000)
  })

  nms.on(
    'donePublish',
    (sessionId: string, streamPath: string, { key }: any) => {
      if (streamPath.includes('hls_')) return
      const session = nms.getSession(sessionId)
      const username = parseStreamName(streamPath)
      if (!username || !key) return session.reject()
      fetch('http://api:5000/api/live', {
        body: JSON.stringify({
          username,
          key,
          live: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
        .then(res => {
          if (!res.ok) return session.reject()
        })
        .catch(err => {
          console.error(err)
          session.reject()
        })
    }
  )

  nms.run()

  setInterval(thumbnails, 60000)
}

function parseStreamName(streamPath: string) {
  return streamPath
    .replace('/hls_1080', '')
    .replace('/hls_720p', '')
    .replace('/hls_480p/', '')
    .replace('/hls_360p/', '')
    .replace('/stream/', '')
}
