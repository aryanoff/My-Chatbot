"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Waveform } from "@/components/voice/waveform";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUIStore } from "@/store";

export function VoicePanel() {
  const { voiceActive, setVoiceActive } = useUIStore();

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Voice Chat</h3>
        <Switch checked={voiceActive} onCheckedChange={setVoiceActive} />
      </div>

      {voiceActive && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <Waveform active={voiceActive} />
          <div className="flex justify-center gap-3">
            <Button variant="glass" size="icon" className="h-14 w-14 rounded-full">
              <Mic className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
              <MicOff className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
              <Volume2 className="h-6 w-6" />
            </Button>
          </div>
          <p className="text-center text-xs text-slate-500">Tap microphone to start speaking</p>
        </motion.div>
      )}
    </div>
  );
}
