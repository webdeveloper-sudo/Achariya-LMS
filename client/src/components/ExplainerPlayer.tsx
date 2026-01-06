import { useState, useRef, useEffect } from 'react';
import { PlayCircle, PauseCircle, RotateCcw, Eye } from 'lucide-react';

interface ExplainerPlayerProps {
    videoUrl: string;
    moduleTitle: string;
}

const ExplainerPlayer = ({ videoUrl, moduleTitle }: ExplainerPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [watchCount, setWatchCount] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Track when video ends to increment watch count
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => {
            setIsPlaying(false);
            setWatchCount(prev => prev + 1);
        };

        video.addEventListener('ended', handleEnded);
        return () => video.removeEventListener('ended', handleEnded);
    }, []);

    // Prevent keyboard shortcuts that could control video
    useEffect(() => {
        const blockShortcuts = (e: KeyboardEvent) => {
            // Block F12, Ctrl+Shift+I (inspect), Ctrl+Shift+C (inspect element)
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'u') // View source
            ) {
                e.preventDefault();
                alert('Developer tools are disabled for content protection');
                return false;
            }

            // Block space bar (pause/play) when focus is on video
            if (e.key === ' ' && document.activeElement === videoRef.current) {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', blockShortcuts);
        return () => window.removeEventListener('keydown', blockShortcuts);
    }, []);

    const handlePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleRestart = () => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = 0;
        video.play();
        setIsPlaying(true);
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        return false;
    };

    return (
        <div className="explainer-container bg-white rounded-xl shadow-sm p-6 border">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    🎨 Visual Story: {moduleTitle}
                </h3>
                <p className="text-sm text-gray-600">
                    Watch this whiteboard-style explanation to understand the concept visually
                </p>
            </div>

            {/* Video Player */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-auto"
                    playsInline
                    preload="auto"
                    // Security attributes
                    controls={false}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    onContextMenu={handleContextMenu}
                    // Prevent default keyboard controls
                    onKeyDown={(e) => e.preventDefault()}
                >
                    Your browser does not support the video tag.
                </video>

                {/* Overlay watermark (subtle) */}
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600">
                    ASM Learning Portal
                </div>
            </div>

            {/* Custom Controls */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-3">
                    <button
                        onClick={handlePlayPause}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {isPlaying ? (
                            <>
                                <PauseCircle className="w-5 h-5 mr-2" />
                                Pause
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-5 h-5 mr-2" />
                                Play
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleRestart}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Restart
                    </button>
                </div>

                {/* Watch Count */}
                <div className="flex items-center text-sm text-gray-600">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>
                        Watched: <span className="font-semibold">{watchCount}</span> time{watchCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Learning Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Watch the entire video to understand the concept flow</li>
                    <li>• Unlimited rewatches available - watch as many times as you need</li>
                    <li>• Focus on how the visuals connect to form the complete picture</li>
                    <li>• After watching, try the quiz to test your understanding</li>
                </ul>
            </div>

            {/* No seeking disclaimer */}
            <p className="text-xs text-gray-500 mt-3 text-center">
                Note: Fast-forward and rewind are disabled to ensure optimal learning experience
            </p>
        </div>
    );
};

export default ExplainerPlayer;
