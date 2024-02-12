import ReactPlayer from 'react-player'
import { useRef, useState } from 'react'
import { Icon } from '@fluentui/react'

export const Instructions = ({ instruction, active, showVideo }) => {
    const [playVideo, setPlayVideo] = useState(false)
    const [fullScreen, setFullScreen] = useState(false)
    const playerRef = useRef(null);

    const handleFullScreenView = (event) => {
        const player = playerRef.current.getInternalPlayer();
        event.stopPropagation()
        setFullScreen(!fullScreen)
        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.mozRequestFullScreen) {
            player.mozRequestFullScreen();
        } else if (player.webkitRequestFullscreen) {
            player.webkitRequestFullscreen();
        } else if (player.msRequestFullscreen) {
            player.msRequestFullscreen();
        }
    }

    const handlePlayVideo = () => {
        setPlayVideo(!playVideo)
    }

    return (
        <div className={`instruction${active ? " active" : ""}`}>
            <div className="instructionImg">
                {
                    instruction.video && showVideo ?
                        <>
                            <ReactPlayer style={{ marginLeft: '10px', marginTop: '15px' }} ref={playerRef} url={instruction.video} playing={playVideo} controls={playVideo} height={"170px"} onPause={handlePlayVideo} />
                            {
                                !playVideo &&
                                <div className='overlay' onClick={handlePlayVideo}>
                                    {instruction.videoTitle}
                                    <Icon className='icon' iconName='FullScreen' onClick={handleFullScreenView} />
                                </div>
                            }
                        </>
                        :
                        <img src={instruction.image} alt="" />
                }
            </div>
            {
                instruction.text &&
                <div className="instructionText">{instruction.text}</div>
            }
        </div>
    )
}