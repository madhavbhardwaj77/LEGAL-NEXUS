import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Send, RefreshCw, Bot } from 'lucide-react';
import api from '../services/api';

export default function VoiceAssistantWidget({ onTranscriptReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'hi-IN'; // Default Hindi/Hinglish/English

      recog.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recog.onerror = () => {
        setIsRecording(false);
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recog);
    }
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      if (recognition) recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setIsRecording(true);
      if (recognition) {
        try {
          recognition.start();
        } catch {
          // Fallback transcription if browser blocks audio
          simulateVoiceTranscription();
        }
      } else {
        simulateVoiceTranscription();
      }
    }
  };

  const simulateVoiceTranscription = async () => {
    try {
      const res = await api.post('/ai/voice/transcribe', {
        language: 'hi-IN',
        simulatedText: 'Mere employer ne 3 mahine se salary nahi di, 150000 rupaye pending hai in Delhi.',
      });
      setTimeout(() => {
        setTranscript(res.data.data?.transcript || '');
        setIsRecording(false);
      }, 1500);
    } catch {
      setIsRecording(false);
    }
  };

  const handleSpeakText = (text) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text || transcript);
    utterance.lang = 'hi-IN';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nyaya-50 text-nyaya-600 rounded-xl">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multilingual Voice Assistant</h3>
            <p className="text-[11px] text-slate-500">Speak your story in English or हिन्दी</p>
          </div>
        </div>

        {isRecording && (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Listening...
          </span>
        )}
      </div>

      {/* Mic Button & Waveform Container */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <button
          onClick={toggleRecording}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
            isRecording
              ? 'bg-red-600 ring-4 ring-red-200 scale-110'
              : 'bg-nyaya-600 hover:bg-nyaya-700 hover:scale-105'
          }`}
        >
          {isRecording ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
        </button>

        <p className="text-xs text-slate-600 text-center font-medium">
          {isRecording ? 'Listening to your story... Speak now' : 'Click microphone to start speaking'}
        </p>
      </div>

      {/* Transcript Box */}
      {transcript && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="p-3 bg-nyaya-50 rounded-xl border border-nyaya-200 text-xs text-slate-800 leading-relaxed font-medium">
            "{transcript}"
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => handleSpeakText(transcript)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isSpeaking ? 'Stop Audio' : 'Listen'}
            </button>

            <button
              onClick={() => onTranscriptReady && onTranscriptReady(transcript)}
              className="px-3 py-1.5 bg-nyaya-600 hover:bg-nyaya-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <Send className="w-3.5 h-3.5" />
              Send to Case Intake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
