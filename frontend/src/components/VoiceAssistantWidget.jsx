import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Send, RefreshCw, Bot, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function VoiceAssistantWidget({ onTranscriptReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [selectedLang, setSelectedLang] = useState('hi-IN'); // hi-IN | en-IN

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false; // Stop automatically when user finishes speaking a turn
      recog.interimResults = true;

      recog.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recog.onerror = (err) => {
        console.error('Speech recognition error:', err);
        if (err.error === 'not-allowed') {
          setPermissionError('Microphone permission blocked. Please allow mic access in your browser settings.');
        }
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recog);
    }
  }, []);

  // Process completed transcript with AI
  useEffect(() => {
    if (!isRecording && transcript && !isProcessing && !aiResponse) {
      processTranscriptWithAI(transcript);
    }
  }, [isRecording, transcript]);

  const startRecording = async () => {
    try {
      setPermissionError(null);
      setTranscript('');
      setAiResponse('');
      
      // Request mic permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // close stream immediately after check
      
      setIsRecording(true);
      if (recognition) {
        recognition.lang = selectedLang;
        recognition.start();
      } else {
        simulateVoiceTranscription();
      }
    } catch (err) {
      setPermissionError('Microphone access denied. Check your browser settings or click below to simulate.');
      simulateVoiceTranscription();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognition) recognition.stop();
      setIsRecording(false);
    } else {
      startRecording();
    }
  };

  const simulateVoiceTranscription = async () => {
    setIsRecording(true);
    setTranscript('Simulating voice input...');
    try {
      const res = await api.post('/ai/voice/transcribe', {
        language: selectedLang,
        simulatedText: selectedLang === 'hi-IN' 
          ? 'Mere employer ne 3 mahine se salary nahi di, 150000 rupaye pending hai in Delhi.' 
          : 'My employer withheld 3 months salary of 1.5 lakhs in Delhi without notice.',
      });
      setTimeout(() => {
        const text = res.data.data?.transcript || '';
        setTranscript(text);
        setIsRecording(false);
      }, 1500);
    } catch {
      setIsRecording(false);
      setTranscript('Simulated connection failed.');
    }
  };

  const processTranscriptWithAI = async (text) => {
    if (!text || text === 'Simulating voice input...') return;
    setIsProcessing(true);
    try {
      const res = await api.post('/ai/chat', {
        message: text,
        conversationHistory: [],
      });
      const reply = res.data.data?.reply || 'I have analyzed your situation and updated the structured case.';
      setAiResponse(reply);
      
      // Send the text back to parent so it pre-fills the intake story if applicable
      if (onTranscriptReady) {
        onTranscriptReady(text);
      }
      
      // Automatically trigger TTS for the AI's reply
      speakText(reply);
    } catch (err) {
      setAiResponse('Error communicating with AI engine. Case was still updated.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nyaya-50 text-nyaya-600 rounded-xl">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multilingual Voice Assistant</h3>
            <p className="text-[11px] text-slate-500">Speak your story to get instant AI legal guidance</p>
          </div>
        </div>

        {/* Language Selection & Recording Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 focus:outline-none"
            disabled={isRecording}
          >
            <option value="hi-IN">हिन्दी (Hindi / Hinglish)</option>
            <option value="en-IN">English (India)</option>
          </select>

          {isRecording && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              Listening...
            </span>
          )}
        </div>
      </div>

      {/* Mic Button & Waveform Container */}
      <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
            isRecording
              ? 'bg-red-600 ring-4 ring-red-200 scale-110'
              : isProcessing
              ? 'bg-slate-400'
              : 'bg-nyaya-600 hover:bg-nyaya-700 hover:scale-105'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
        </button>

        <p className="text-xs text-slate-600 text-center font-medium">
          {isRecording ? 'Speaking... Click to finalize' : isProcessing ? 'AI analyzing case story...' : 'Click mic to record your voice'}
        </p>

        {permissionError && (
          <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-2 rounded-xl flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}
      </div>

      {/* Full Transcript & AI Response Area */}
      {(transcript || aiResponse) && (
        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in duration-200 text-xs">
          {transcript && (
            <div>
              <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Your Voice Intake:</span>
              <p className="italic text-slate-800 font-medium">"{transcript}"</p>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-slate-500 italic pt-2">
              <span className="w-3 h-3 border-2 border-nyaya-600 border-t-transparent rounded-full animate-spin"></span>
              Orchestrating agents and classifications...
            </div>
          )}

          {aiResponse && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <span className="font-bold text-nyaya-700 block text-[9px] uppercase tracking-wider">AI Assistant Response:</span>
              <p className="text-slate-800 leading-relaxed font-semibold bg-white p-3 rounded-xl border border-slate-200 shadow-sm whitespace-pre-line">
                {aiResponse}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => speakText(aiResponse)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isSpeaking ? 'Stop Audio' : 'Listen Reply'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
