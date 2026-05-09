import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface VideoPlayerProps {
    streamUrl?: string;
    episodeSession?: string;
    isLoading: boolean;
    hasPlayableSource?: boolean;
    streamExhausted?: boolean;
    onLoad?: () => void;
}

export default function VideoPlayer({
    streamUrl,
    episodeSession,
    isLoading,
    hasPlayableSource = true,
    streamExhausted = false,
    onLoad,
}: VideoPlayerProps) {

    return (
        <div className="watch-player-shell w-full h-full max-h-full relative bg-[#0b0c0f] group transition-all duration-300 overflow-visible rounded-none shadow-none md:rounded-t-2xl md:rounded-b-none md:shadow-2xl md:shadow-black/80">

            {isLoading ? (

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-400 animate-pulse">
                        Loading Stream...
                    </p>
                </div>

            ) : streamUrl ? (

                <div className="relative w-full h-full z-10 flex items-center justify-center overflow-hidden">

                    <iframe
                        key={`${episodeSession ?? ''}::${streamUrl ?? ''}`}
                        src={streamUrl}
                        className="w-full h-full border-0 bg-black rounded-none md:rounded-t-2xl md:rounded-b-none"
                        loading="eager"
                        allowFullScreen
                        allow="autoplay; fullscreen"
                        referrerPolicy="no-referrer"
                        title="Video Player"
                        onLoad={onLoad}
                    />

                </div>

            ) : !hasPlayableSource || streamExhausted ? (

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-400 animate-pulse">
                        {streamExhausted
                            ? 'Still retrying stream...'
                            : 'Retrying stream...'}
                    </p>
                </div>

            ) : (

                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <span className="mb-2 text-6xl opacity-20">▶</span>
                    <p>Select an episode</p>
                </div>

            )}

        </div>
    );
}