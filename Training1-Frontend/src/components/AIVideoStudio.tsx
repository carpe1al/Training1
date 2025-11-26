'use client';

import React, { useState } from 'react';

interface VideoScene {
  id: string;
  type: 'avatar' | 'text' | 'image' | 'animation';
  duration: number;
  voiceText?: string;
  voiceConfig?: {
    voiceId: string;
    speed: number;
    pitch: number;
  };
  avatarId?: string;
  config: any;
}

interface AIVideoStudioProps {
  projectId?: string;
  onSave?: (project: any) => void;
  onGenerate?: (projectId: string) => void;
}

export default function AIVideoStudio({ projectId, onSave, onGenerate }: AIVideoStudioProps) {
  const [scenes, setScenes] = useState<VideoScene[]>([]);
  const [selectedScene, setSelectedScene] = useState<VideoScene | null>(null);
  const [projectTitle, setProjectTitle] = useState('Untitled Video Project');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Mock data - replace with API calls
  const [availableAvatars] = useState([
    { id: '1', name: 'Professional Woman', gender: 'female', thumbnail: '/avatars/woman1.jpg' },
    { id: '2', name: 'Business Man', gender: 'male', thumbnail: '/avatars/man1.jpg' },
    { id: '3', name: 'Friendly Teacher', gender: 'female', thumbnail: '/avatars/teacher1.jpg' }
  ]);

  const [availableVoices] = useState([
    { id: 'en-US-1', name: 'Rachel - Professional', language: 'en-US', gender: 'female' },
    { id: 'en-US-2', name: 'John - Confident', language: 'en-US', gender: 'male' },
    { id: 'en-US-3', name: 'Emma - Friendly', language: 'en-US', gender: 'female' }
  ]);

  const addScene = (type: VideoScene['type']) => {
    const newScene: VideoScene = {
      id: `scene-${Date.now()}`,
      type,
      duration: 5,
      config: {}
    };

    setScenes([...scenes, newScene]);
    setSelectedScene(newScene);
  };

  const updateScene = (sceneId: string, updates: Partial<VideoScene>) => {
    setScenes(scenes.map((s) => (s.id === sceneId ? { ...s, ...updates } : s)));
    if (selectedScene?.id === sceneId) {
      setSelectedScene({ ...selectedScene, ...updates });
    }
  };

  const deleteScene = (sceneId: string) => {
    setScenes(scenes.filter((s) => s.id !== sceneId));
    if (selectedScene?.id === sceneId) {
      setSelectedScene(null);
    }
  };

  const moveScene = (sceneId: string, direction: 'up' | 'down') => {
    const idx = scenes.findIndex((s) => s.id === sceneId);
    if (idx === -1) return;

    const newScenes = [...scenes];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= newScenes.length) return;

    [newScenes[idx], newScenes[targetIdx]] = [newScenes[targetIdx], newScenes[idx]];
    setScenes(newScenes);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 5;
      });
    }, 500);

    // Call API to generate video
    onGenerate?.(projectId || 'new-project');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Scene List */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full text-xl font-bold border-none focus:outline-none"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-3">Add Scene</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => addScene('avatar')}
              className="p-3 border rounded hover:bg-gray-50 text-sm"
            >
              👤 Avatar
            </button>
            <button onClick={() => addScene('text')} className="p-3 border rounded hover:bg-gray-50 text-sm">
              📝 Text
            </button>
            <button onClick={() => addScene('image')} className="p-3 border rounded hover:bg-gray-50 text-sm">
              🖼️ Image
            </button>
            <button
              onClick={() => addScene('animation')}
              className="p-3 border rounded hover:bg-gray-50 text-sm"
            >
              ✨ Animation
            </button>
          </div>

          <h3 className="font-semibold mb-3">Scenes ({scenes.length})</h3>
          <div className="space-y-2">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`p-3 border rounded cursor-pointer ${
                  selectedScene?.id === scene.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {idx + 1}. {scene.type.charAt(0).toUpperCase() + scene.type.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500">{scene.duration}s</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveScene(scene.id, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveScene(scene.id, 'down');
                      }}
                      disabled={idx === scenes.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(scene.id);
                      }}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleGenerate}
            disabled={scenes.length === 0 || isGenerating}
            className="w-full py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? `Generating... ${generationProgress}%` : 'Generate Video'}
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-y-auto">
        {selectedScene ? (
          <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              Edit Scene {scenes.findIndex((s) => s.id === selectedScene.id) + 1}
            </h2>

            {/* Duration */}
            <div className="mb-6">
              <label className="block font-medium mb-2">Duration (seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={selectedScene.duration}
                onChange={(e) => updateScene(selectedScene.id, { duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            {/* Scene Type Specific Fields */}
            {selectedScene.type === 'avatar' && (
              <AvatarSceneEditor
                scene={selectedScene}
                avatars={availableAvatars}
                voices={availableVoices}
                onUpdate={(updates) => updateScene(selectedScene.id, updates)}
              />
            )}

            {selectedScene.type === 'text' && (
              <TextSceneEditor
                scene={selectedScene}
                voices={availableVoices}
                onUpdate={(updates) => updateScene(selectedScene.id, updates)}
              />
            )}

            {selectedScene.type === 'image' && (
              <ImageSceneEditor
                scene={selectedScene}
                voices={availableVoices}
                onUpdate={(updates) => updateScene(selectedScene.id, updates)}
              />
            )}

            {selectedScene.type === 'animation' && (
              <AnimationSceneEditor
                scene={selectedScene}
                onUpdate={(updates) => updateScene(selectedScene.id, updates)}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-xl">Select a scene to edit or add a new one</div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-96 bg-white border-l p-4">
        <h3 className="font-semibold mb-4">Preview</h3>
        <div className="aspect-video bg-gray-900 rounded mb-4 flex items-center justify-center text-white">
          Preview Player
        </div>
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-2">
            <span>Total Duration:</span>
            <span className="font-medium">{scenes.reduce((acc, s) => acc + s.duration, 0)}s</span>
          </div>
          <div className="flex justify-between">
            <span>Total Scenes:</span>
            <span className="font-medium">{scenes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Avatar Scene Editor
function AvatarSceneEditor({ scene, avatars, voices, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Select Avatar</label>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((avatar: any) => (
            <div
              key={avatar.id}
              onClick={() => onUpdate({ avatarId: avatar.id })}
              className={`border-2 rounded cursor-pointer ${
                scene.avatarId === avatar.id ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <img src={avatar.thumbnail} alt={avatar.name} className="w-full aspect-square object-cover rounded-t" />
              <div className="p-2 text-sm text-center">{avatar.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Script (What the avatar says)</label>
        <textarea
          value={scene.voiceText || ''}
          onChange={(e) => onUpdate({ voiceText: e.target.value })}
          placeholder="Enter the script for this scene..."
          className="w-full px-4 py-2 border rounded h-32"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Voice</label>
        <select
          value={scene.voiceConfig?.voiceId || ''}
          onChange={(e) =>
            onUpdate({
              voiceConfig: { ...scene.voiceConfig, voiceId: e.target.value }
            })
          }
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select voice...</option>
          {voices.map((voice: any) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Text Scene Editor
function TextSceneEditor({ scene, voices, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Text Content</label>
        <textarea
          value={scene.config.text || ''}
          onChange={(e) => onUpdate({ config: { ...scene.config, text: e.target.value } })}
          placeholder="Enter text to display..."
          className="w-full px-4 py-2 border rounded h-32"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-2">Background Color</label>
          <input
            type="color"
            value={scene.config.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdate({ config: { ...scene.config, backgroundColor: e.target.value } })}
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Text Color</label>
          <input
            type="color"
            value={scene.config.textColor || '#000000'}
            onChange={(e) => onUpdate({ config: { ...scene.config, textColor: e.target.value } })}
            className="w-full h-10 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Font Size</label>
        <input
          type="range"
          min="24"
          max="120"
          value={scene.config.fontSize || 48}
          onChange={(e) => onUpdate({ config: { ...scene.config, fontSize: parseInt(e.target.value) } })}
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600">{scene.config.fontSize || 48}px</div>
      </div>
    </div>
  );
}

// Image Scene Editor
function ImageSceneEditor({ scene, voices, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            // TODO: Handle file upload
            console.log('File selected:', e.target.files?.[0]);
          }}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Voiceover (optional)</label>
        <textarea
          value={scene.voiceText || ''}
          onChange={(e) => onUpdate({ voiceText: e.target.value })}
          placeholder="Add narration for this image..."
          className="w-full px-4 py-2 border rounded h-24"
        />
      </div>
    </div>
  );
}

// Animation Scene Editor
function AnimationSceneEditor({ scene, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Animation Type</label>
        <select
          value={scene.config.animationType || 'fade'}
          onChange={(e) => onUpdate({ config: { ...scene.config, animationType: e.target.value } })}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="fade">Fade In/Out</option>
          <option value="slide">Slide</option>
          <option value="zoom">Zoom</option>
          <option value="lottie">Lottie Animation</option>
        </select>
      </div>
    </div>
  );
}
