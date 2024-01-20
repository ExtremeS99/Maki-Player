import { useBoundStore } from "../../store/store";
import songfallback from "../../assets/icons8-song-fallback.png";
import speaker from "../../assets/speaker-svgrepo.svg";
import favorite from "../../assets/icons8-heart.svg";
import favorited from "../../assets/icons8-favorited.svg";
import add from "../../assets/icons8-addplaylist-28.svg";
import high from "../../assets/volume-high.svg";
import vol from "../../assets/volume-min-svgrepo.svg";
import mute from "../../assets/mute-svgrepo-com.svg";
import replay from "../../assets/replay.svg";
import shuffle from "../../assets/icons8-shuffle.svg";
import random from "../../assets/icons8-shuffle-activated.svg";
import previous from "../../assets/previous.svg";
import next from "../../assets/next.svg";
import play from "../../assets/icons8-play.svg";
import pause from "../../assets/icons8-pause.svg";
import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import secondsToHMS from "../../utils/utils";
import tick from "../../assets/icons8-tick.svg";
import "../../App.css";
import { TrackDetails } from "../../types/GlobalTypes";

export default function NowPlaying() {
  const {
    library,
    nowPlaying,
    setFavoriteSong,
    favorites,
    removeFavorite,
    setIsPlaying,
    removeFromUserPlaylist,
    setCreationTrack,
    setRevealCreation,
    isShuffling,
    setNowPlaying,
    setShowPlayer,
    setIsShuffling,
  } = useBoundStore();
  const [volume, setVolume] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const songIndex = nowPlaying.queue.songs?.findIndex(
    (song: TrackDetails) => song.id === nowPlaying.track?.id,
  ); //current index of song in queue
  const formatTime = (seconds: number) =>
    [seconds / 60, seconds % 60]
      .map((v) => `0${Math.floor(v)}`.slice(-2))
      .join(":");
  const playlist = library.userPlaylists.find((obj) => {
    return obj.songs.find((song) => {
      return song.id === nowPlaying.track?.id;
    });
  });
  function removeFromPlaylist(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    playlistid: number,
  ) {
    e.preventDefault();
    e.stopPropagation();
    removeFromUserPlaylist(playlistid, nowPlaying.track?.id);
  }
  function handlePlay(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    wavesurfer.current?.play();
    setIsPlaying(true);
  }
  function handlePause(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    wavesurfer.current?.pause();
    setIsPlaying(false);
  }
  function revealTrackMenu(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    e.preventDefault();
    setCreationTrack(nowPlaying.track);
    setRevealCreation(true);
  }

  function playOrder() {
    if (isShuffling === false) {
      setIsPlaying(true);
      songIndex && setNowPlaying(nowPlaying.queue.songs[songIndex + 1]);
    } else {
      const randomIndex = Math.floor(
        Math.random() * nowPlaying.queue.songs.length,
      );
      setNowPlaying(nowPlaying.queue.songs[randomIndex]);
    }
  }

  useEffect(() => {
    switch (true) {
      case wavesurfer.current?.isPlaying() === false &&
        nowPlaying.isPlaying === true:
        wavesurfer.current.play();
        break;
      case wavesurfer.current?.isPlaying() === true &&
        nowPlaying.isPlaying === false:
        wavesurfer.current.pause();
        break;
    }
  }, [nowPlaying.isPlaying]);

  useEffect(() => {
    if (innerWidth > 640) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      wavesurfer.current = WaveSurfer.create({
        container: "#desktopWave",
        autoScroll: true,
        autoplay: true,
        backend: "WebAudio",
        dragToSeek: true,
        hideScrollbar: true,
        mediaControls: true,
        waveColor: "#333",
        progressColor: "#10B981",
        fillParent: true,
        barGap: 1,
        barWidth: 2,
        minPxPerSec: 1,
        height: 12,
      });
      wavesurfer.current?.load(nowPlaying.track?.downloadUrl[4].link);
      wavesurfer.current?.seekTo(0);
      wavesurfer.current?.setVolume(volume);
    }
    wavesurfer.current?.on("seeking", () => {
      wavesurfer.current && setCurrentTime(wavesurfer.current.getCurrentTime());
    });
    wavesurfer.current?.on("timeupdate", () => {
      wavesurfer.current && setCurrentTime(wavesurfer.current.getCurrentTime());
    });
    wavesurfer.current?.on("finish", () => {
      setIsPlaying(false);
      if (!songIndex) {
        setShowPlayer(false);
      } else {
        playOrder();
      }
    });
    wavesurfer.current?.on("ready", () => {
      setIsPlaying(true);
    });
    return () => {
      wavesurfer.current?.destroy();
      wavesurfer.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying.track?.id]);

  return (
    <div className="absolute bottom-0 hidden h-[70px] w-full justify-between bg-black sm:flex">
      <div className="flex h-full w-[30%] max-w-[300px] items-center justify-center p-2.5">
        <img
          src={
            nowPlaying.track ? nowPlaying.track?.image[2]?.link : songfallback
          }
          id="songImg"
          alt="song-img"
          onError={(e) => (e.currentTarget.src = songfallback)}
          className="mr-3 h-[50px] w-[50px] flex-shrink-0 rounded-md"
        />
        <div className="flex h-full w-full max-w-[300px] flex-col items-start justify-center overflow-hidden text-ellipsis">
          <h2 className="line-clamp-1 whitespace-nowrap text-sm text-white">
            {nowPlaying.track?.name}
          </h2>
          <p className="line-clamp-1 whitespace-nowrap text-xs text-neutral-400">
            {nowPlaying.track?.primaryArtists}
          </p>
        </div>
      </div>
      <div className="mb-1 flex h-full w-auto flex-col items-center justify-evenly p-1.5 sm:w-[40%]">
        {/*Controls */}
        <div className="flex w-[250px] items-center justify-around pt-0.5">
          {isShuffling ? (
            <button
              style={{
                border: "none",
                outline: "none",
              }}
              className="border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:invert-[0.5]"
              onClick={(e) => {
                e.stopPropagation();
                setIsShuffling(false);
              }}
              disabled={nowPlaying.queue.songs.length === 0}
            >
              <img
                src={random}
                alt="random"
                className="h-[20px] w-[20px] bg-transparent"
              />
            </button>
          ) : (
            <button
              style={{
                border: "none",
                outline: "none",
              }}
              className="border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:invert-[0.5]"
              onClick={(e) => {
                e.stopPropagation();
                setIsShuffling(true);
              }}
              disabled={nowPlaying.queue.songs.length === 0}
            >
              <img
                src={shuffle}
                alt="shuffle"
                className="h-[20px] w-[20px] bg-transparent"
              />
            </button>
          )}
          <button
            onClick={() =>
              songIndex === 0
                ? setNowPlaying(nowPlaying.queue.songs[0])
                : setNowPlaying(nowPlaying.queue.songs[songIndex - 1])
            }
            style={{
              border: "none",
              outline: "none",
            }}
            className="border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:invert-[0.5]"
            disabled={nowPlaying.queue.songs.length === 0}
          >
            <img
              src={previous}
              alt="previous"
              className="h-[28px] w-[28px] bg-transparent"
            />
          </button>
          {nowPlaying.isPlaying === true ? (
            <button
              type="button"
              onClick={(e) => handlePause(e)}
              style={{
                border: "none",
                outline: "none",
              }}
              className={`h-auto w-auto rounded-full border-none bg-neutral-100 p-1 outline-none disabled:cursor-not-allowed disabled:bg-neutral-600`}
              // disabled={isReady === false}
            >
              <img
                src={pause}
                alt="pause"
                className={`h-[25px] w-[25px] ${
                  nowPlaying.isPlaying ? "pl-0" : "pl-0.5"
                }`}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => handlePlay(e)}
              style={{
                border: "none",
                outline: "none",
              }}
              className={`h-auto w-auto rounded-full border-none bg-neutral-100 p-1 outline-none disabled:cursor-not-allowed disabled:bg-neutral-600`}
              // disabled={isReady === false}
            >
              <img
                src={play}
                alt="play"
                className={`h-[25px] w-[25px] ${
                  nowPlaying.isPlaying ? "pl-0" : "pl-0.5"
                }`}
              />
            </button>
          )}
          <button
            className="border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:invert-[0.5]"
            style={{
              border: "none",
              outline: "none",
            }}
            onClick={() =>
              songIndex === nowPlaying.queue.songs.length - 1
                ? setNowPlaying(nowPlaying.queue.songs[0])
                : setNowPlaying(nowPlaying.queue.songs[songIndex + 1])
            }
            disabled={nowPlaying.queue.songs.length === 0}
          >
            <img
              src={next}
              alt="next"
              className="h-[28px] w-[28px] bg-transparent"
            />
          </button>
          <button
            className="border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:invert-[0.5]"
            disabled={true}
          >
            <img
              src={replay}
              alt="replay"
              className="h-[23px] w-[23px] bg-transparent"
            />
          </button>
        </div>
        {/*Progress */}
        <div className="mt-1 flex h-5 w-[350px] items-center justify-between lg:w-[500px] xl:w-[700px]">
          <p className="h-full w-[5%] text-[12px] text-white">
            {currentTime ? formatTime(currentTime) : "0:00"}
          </p>
          {/*Waveform*/}
          <div className="flex h-auto w-[80%] items-center justify-center overflow-hidden lg:w-[90%]">
            <div id="desktopWave" className="h-full w-full"></div>
          </div>
          <p className="-ml-4 h-full w-[5%] text-[12px] text-white">
            {nowPlaying.track?.duration
              ? secondsToHMS(Number(nowPlaying.track?.duration))
              : ""}
          </p>
        </div>
      </div>
      <div className="flex h-full w-[30%] max-w-[290px] flex-col items-end justify-between p-2 pb-1">
        <div className="flex w-auto max-w-32 items-center">
          <button
            style={{
              border: "none",
              outline: "none",
            }}
            className={`${
              !playlist ? "block" : "hidden"
            } border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:invert-[0.5]`}
            onClick={(e) => revealTrackMenu(e)}
            disabled={nowPlaying.track?.id === ""}
          >
            <img
              src={add}
              alt="add-to-playlist"
              className="h-[20px] w-[20px] bg-transparent"
            />
          </button>
          {playlist?.id && (
            <button
              style={{
                border: "none",
                outline: "none",
              }}
              type="button"
              onClick={(e) => playlist && removeFromPlaylist(e, playlist.id)}
              className="border bg-transparent p-0"
            >
              <img src={tick} alt="tick" className="h-[20px] w-[20px]" />
            </button>
          )}
          {favorites.songs?.some((song) => song.id === nowPlaying.track?.id) ? (
            <button
              onClick={() => removeFavorite(nowPlaying.track?.id)}
              style={{
                border: "none",
                outline: "none",
              }}
              className="mx-3 border-none bg-transparent p-0 outline-none"
            >
              <img
                src={favorited}
                alt="favorite"
                className="h-[22px] w-[22px] bg-transparent"
              />
            </button>
          ) : (
            <button
              onClick={() => setFavoriteSong(nowPlaying.track)}
              style={{
                border: "none",
                outline: "none",
              }}
              className="mx-3 border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:invert-[0.5]"
              disabled={nowPlaying.track?.id === ""}
            >
              <img
                src={favorite}
                alt="favorite"
                className="h-[22px] w-[22px] bg-transparent"
              />
            </button>
          )}
          <div className="border-none bg-transparent p-0 outline-none">
            <img
              src={speaker}
              alt="favorite"
              className="h-[22px] w-[22px] bg-transparent"
            />
          </div>
        </div>
        <div className="flex w-auto items-center justify-end pb-1">
          <input
            type="range"
            name="song-volume"
            id="volumeSlider"
            min={0}
            className="h-[3px] w-full appearance-none transition-all ease-linear disabled:cursor-not-allowed"
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            disabled={nowPlaying.track?.id === ""}
          />
          <img
            src={volume > 0.1 ? (volume < 0.7 ? vol : high) : mute}
            alt="volume"
            className={`ml-1 h-[28px] w-[28px] bg-transparent ${
              nowPlaying.track?.id === "" ? "invert-[0.4]" : ""
            } ${
              volume === 0 && "invert-[0.5]"
            } disabled:cursor-not-allowed disabled:bg-neutral-900`}
          />
        </div>
      </div>
    </div>
  );
}
