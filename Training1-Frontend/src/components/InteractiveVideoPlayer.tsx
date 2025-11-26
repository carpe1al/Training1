'use client';

import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface VideoInteraction {
  id: string;
  type: 'question' | 'hotspot' | 'overlay' | 'chapter' | 'link';
  timestamp: number; // seconds
  duration?: number;
  config: any;
  required: boolean;
}

interface InteractiveVideoPlayerProps {
  videoId: string;
  videoUrl: string;
  interactions: VideoInteraction[];
  enrollmentId?: string;
  onComplete?: () => void;
  onInteractionResponse?: (interactionId: string, response: any) => void;
}

export default function InteractiveVideoPlayer({
  videoId,
  videoUrl,
  interactions,
  enrollmentId,
  onComplete,
  onInteractionResponse
}: InteractiveVideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeInteraction, setActiveInteraction] = useState<VideoInteraction | null>(null);
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set());
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});

  // Check for interactions at current playback time
  useEffect(() => {
    const interaction = interactions.find(
      (i) =>
        currentTime >= i.timestamp &&
        currentTime < i.timestamp + (i.duration || 5) &&
        !completedInteractions.has(i.id)
    );

    if (interaction && !activeInteraction) {
      setActiveInteraction(interaction);
      if (interaction.required) {
        setPlaying(false); // Pause video for required interactions
      }
    } else if (!interaction && activeInteraction) {
      setActiveInteraction(null);
    }
  }, [currentTime, interactions, activeInteraction, completedInteractions]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleInteractionSubmit = (response: any) => {
    if (!activeInteraction) return;

    setUserResponses((prev) => ({
      ...prev,
      [activeInteraction.id]: response
    }));

    setCompletedInteractions((prev) => new Set(prev).add(activeInteraction.id));

    onInteractionResponse?.(activeInteraction.id, response);

    setActiveInteraction(null);
    setPlaying(true); // Resume playback
  };

  const handleSkipInteraction = () => {
    if (activeInteraction && !activeInteraction.required) {
      setActiveInteraction(null);
      setPlaying(true);
    }
  };

  const renderInteraction = () => {
    if (!activeInteraction) return null;

    switch (activeInteraction.type) {
      case 'question':
        return <QuestionInteraction interaction={activeInteraction} onSubmit={handleInteractionSubmit} />;
      case 'hotspot':
        return <HotspotInteraction interaction={activeInteraction} onSubmit={handleInteractionSubmit} />;
      case 'overlay':
        return <OverlayInteraction interaction={activeInteraction} />;
      case 'chapter':
        return <ChapterMarker interaction={activeInteraction} />;
      case 'link':
        return <LinkInteraction interaction={activeInteraction} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        controls
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onEnded={() => onComplete?.()}
        progressInterval={100}
      />

      {/* Interaction Overlay */}
      {activeInteraction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 p-6">
            {renderInteraction()}
            {!activeInteraction.required && (
              <button
                onClick={handleSkipInteraction}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress Indicators */}
      <div className="absolute bottom-16 left-0 right-0 pointer-events-none">
        <div className="relative h-1">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className={`absolute h-3 w-1 -top-1 ${
                completedInteractions.has(interaction.id) ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ left: `${(interaction.timestamp / (playerRef.current?.getDuration() || 1)) * 100}%` }}
              title={interaction.type}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Question Interaction Component
function QuestionInteraction({
  interaction,
  onSubmit
}: {
  interaction: VideoInteraction;
  onSubmit: (response: any) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit({ answer: selectedOption });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{interaction.config.question}</h3>
      <div className="space-y-2">
        {interaction.config.options.map((option: string, idx: number) => (
          <label key={idx} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="question"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
              className="mr-3"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selectedOption}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Submit Answer
      </button>
    </div>
  );
}

// Hotspot Interaction Component
function HotspotInteraction({
  interaction,
  onSubmit
}: {
  interaction: VideoInteraction;
  onSubmit: (response: any) => void;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{interaction.config.prompt}</h3>
      <p className="mb-4 text-gray-600">Click on the correct area</p>
      <div className="relative">
        <img src={interaction.config.image} alt="Hotspot" className="w-full" />
        {/* Render clickable hotspots */}
        {interaction.config.hotspots.map((spot: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onSubmit({ hotspotId: spot.id })}
            className="absolute border-2 border-blue-500 hover:bg-blue-200 hover:bg-opacity-50"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              width: `${spot.width}%`,
              height: `${spot.height}%`
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Overlay Interaction Component
function OverlayInteraction({ interaction }: { interaction: VideoInteraction }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold mb-2">{interaction.config.title}</div>
      <div className="text-lg">{interaction.config.text}</div>
    </div>
  );
}

// Chapter Marker Component
function ChapterMarker({ interaction }: { interaction: VideoInteraction }) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-500 mb-1">Chapter</div>
      <div className="text-xl font-bold">{interaction.config.title}</div>
    </div>
  );
}

// Link Interaction Component
function LinkInteraction({ interaction }: { interaction: VideoInteraction }) {
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4">{interaction.config.title}</h3>
      <p className="mb-4 text-gray-600">{interaction.config.description}</p>
      <a
        href={interaction.config.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Link
      </a>
    </div>
  );
}
