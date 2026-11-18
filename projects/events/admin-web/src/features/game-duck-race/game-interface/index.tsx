'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Maximize2, Minimize2, Play, RotateCcw, Tag, Trophy, Users, Volume2, VolumeX } from 'lucide-react';
import { useStyle } from './use-style';

export interface DuckRaceParticipant {
   id: string;
   full_name: string;
   ticket_code: string;
   department?: string | null;
}

export interface GameDuckRaceInterfaceProps {
   participants?: DuckRaceParticipant[];
   prizeName?: string;
   /** Optional deterministic winner ID from backend atomic draw */
   predeterminedWinnerId?: string;
   onRaceFinish?: (winner: DuckRaceParticipant, podium: DuckRaceParticipant[]) => void;
}

type RaceStatus = 'IDLE' | 'RACING' | 'FINISHED';
type LabelMode = 'TOP_5' | 'ALL' | 'NONE';

interface DuckEntity {
   participant: DuckRaceParticipant;
   bibNumber: number;
   laneYRatio: number; // 0..1 vertical distribution in water
   colorBody: string;
   colorWing: string;
   hatColor: string;
   // Physics & choreography parameters
   progress: number; // 0..1 normalized progress toward finish line
   currentSpeed: number;
   phase1: number;
   phase2: number;
   freq1: number;
   freq2: number;
   finalTargetRank: number; // 0 = 1st place winner, 1 = 2nd, etc.
   finalFinishProgress: number; // 1.0 for winner, < 1.0 for others
   bobOffset: number;
}

const DUCK_PALETTES = [
   { body: '#FFD60A', wing: '#FCA311', hat: '#EF476F' },
   { body: '#06D6A0', wing: '#05A87D', hat: '#118AB2' },
   { body: '#FF6B6B', wing: '#E04F4F', hat: '#FFD166' },
   { body: '#4CC9F0', wing: '#3A9EC2', hat: '#7209B7' },
   { body: '#F72585', wing: '#B5179E', hat: '#4CC9F0' },
   { body: '#A7C957', wing: '#6A994E', hat: '#BC4749' },
   { body: '#FF9F1C', wing: '#E76F51', hat: '#2EC4B6' },
   { body: '#C77DFF', wing: '#9D4EDD', hat: '#FF9E00' },
];

// Built-in Web Audio synthesizer (no external mp3 dependencies required)
class DuckSoundEngine {
   private ctx: AudioContext | null = null;
   public muted = false;

   private getContext(): AudioContext | null {
      if (this.muted || typeof window === 'undefined') return null;
      if (!this.ctx) {
         const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
         this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
         this.ctx.resume().catch(() => {});
      }
      return this.ctx;
   }

   playStartHorn() {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         osc.type = 'triangle';
         osc.frequency.setValueAtTime(freq, now + idx * 0.11);
         gain.gain.setValueAtTime(0.15, now + idx * 0.11);
         gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.25);
         osc.connect(gain);
         gain.connect(ctx.destination);
         osc.start(now + idx * 0.11);
         osc.stop(now + idx * 0.11 + 0.26);
      });
   }

   playQuack() {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 280 + Math.random() * 90;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.62, now + 0.14);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
   }

   playVictory() {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      const times = [0, 0.12, 0.24, 0.36, 0.52, 0.66];
      notes.forEach((freq, i) => {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         osc.type = 'triangle';
         osc.frequency.setValueAtTime(freq, now + times[i]);
         gain.gain.setValueAtTime(0.18, now + times[i]);
         gain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + 0.35);
         osc.connect(gain);
         gain.connect(ctx.destination);
         osc.start(now + times[i]);
         osc.stop(now + times[i] + 0.36);
      });
   }
}

export const GameDuckRaceInterface: React.FC<GameDuckRaceInterfaceProps> = ({
   participants: externalParticipants,
   prizeName = 'Giải Đặc Biệt - Duck Race Championship',
   predeterminedWinnerId,
   onRaceFinish,
}) => {
   const styles = useStyle();
   const wrapperRef = useRef<HTMLDivElement | null>(null);
   const canvasRef = useRef<HTMLCanvasElement | null>(null);
   const soundRef = useRef<DuckSoundEngine | null>(null);

   const [duckCount, setDuckCount] = useState<number>(25);
   const [durationSec, setDurationSec] = useState<number>(15);
   const [status, setStatus] = useState<RaceStatus>('IDLE');
   const [remainingMs, setRemainingMs] = useState<number>(15 * 1000);
   const [labelMode, setLabelMode] = useState<LabelMode>('TOP_5');
   const [isMuted, setIsMuted] = useState<boolean>(false);
   const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
   const [leaders, setLeaders] = useState<DuckEntity[]>([]);
   const [podium, setPodium] = useState<DuckEntity[]>([]);

   // Generate fallback mock attendants if none passed via props
   const activeParticipants = useMemo<DuckRaceParticipant[]>(() => {
      const count = Math.min(100, Math.max(2, duckCount));
      if (externalParticipants && externalParticipants.length >= 2) {
         return externalParticipants.slice(0, count);
      }
      return Array.from({ length: count }, (_, idx) => {
         const num = idx + 1;
         return {
            id: `duck-${num}`,
            full_name: `Nguyễn Văn Duck #${num}`,
            ticket_code: `DR-${String(num).padStart(3, '0')}`,
            department: ['Engineering', 'Marketing', 'Sales', 'Product', 'Operations'][idx % 5],
         };
      });
   }, [externalParticipants, duckCount]);

   const ducksRef = useRef<DuckEntity[]>([]);
   const animFrameRef = useRef<number>(0);
   const raceStartPerfRef = useRef<number>(0);
   const cameraScrollRef = useRef<number>(0);
   const hoveredDuckIdRef = useRef<string | null>(null);

   useEffect(() => {
      soundRef.current = new DuckSoundEngine();
   }, []);

   // Initialize or reset ducks in starting formation
   const initDucks = useCallback(() => {
      const total = activeParticipants.length;
      // Shuffle rank order so a random or predetermined duck wins
      const ranks = Array.from({ length: total }, (_, i) => i);
      for (let i = ranks.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
      }

      if (predeterminedWinnerId) {
         const targetIdx = activeParticipants.findIndex((p) => p.id === predeterminedWinnerId);
         if (targetIdx !== -1) {
            const currentZeroHolder = ranks.indexOf(0);
            ranks[currentZeroHolder] = ranks[targetIdx];
            ranks[targetIdx] = 0;
         }
      }

      const entities: DuckEntity[] = activeParticipants.map((participant, idx) => {
         const palette = DUCK_PALETTES[idx % DUCK_PALETTES.length];
         const rank = ranks[idx];
         // Winner finishes at progress = 1.0; runner-ups finish tightly spaced between 0.72 and 0.985
         const finalFinishProgress =
            rank === 0 ? 1.0 : Math.max(0.68, 0.985 - (rank / Math.max(1, total - 1)) * 0.28 - Math.random() * 0.015);

         return {
            participant,
            bibNumber: idx + 1,
            laneYRatio: (idx + 0.5) / total,
            colorBody: palette.body,
            colorWing: palette.wing,
            hatColor: palette.hat,
            progress: 0,
            currentSpeed: 0,
            phase1: Math.random() * Math.PI * 2,
            phase2: Math.random() * Math.PI * 2,
            freq1: 1.8 + Math.random() * 2.2,
            freq2: 3.5 + Math.random() * 3.0,
            finalTargetRank: rank,
            finalFinishProgress,
            bobOffset: Math.random() * Math.PI * 2,
         };
      });

      ducksRef.current = entities;
      setLeaders(entities.slice(0, 5));
      setPodium([]);
      setRemainingMs(durationSec * 1000);
   }, [activeParticipants, durationSec, predeterminedWinnerId]);

   useEffect(() => {
      if (status === 'IDLE') {
         initDucks();
      }
   }, [initDucks, status]);

   const startRace = useCallback(() => {
      initDucks();
      raceStartPerfRef.current = performance.now();
      setStatus('RACING');
      soundRef.current?.playStartHorn();
   }, [initDucks]);

   const resetRace = useCallback(() => {
      setStatus('IDLE');
      initDucks();
   }, [initDucks]);

   const toggleFullscreen = useCallback(() => {
      if (!wrapperRef.current) return;
      if (!document.fullscreenElement) {
         wrapperRef.current.requestFullscreen().catch(() => {});
         setIsFullscreen(true);
      } else {
         document.exitFullscreen().catch(() => {});
         setIsFullscreen(false);
      }
   }, []);

   // Keyboard shortcuts matching @admin-web operator stage
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            if (status === 'RACING') resetRace();
            else startRace();
         } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            setLabelMode((prev) => (prev === 'TOP_5' ? 'ALL' : prev === 'ALL' ? 'NONE' : 'TOP_5'));
         } else if (e.ctrlKey && e.key.toLowerCase() === 'm') {
            e.preventDefault();
            setIsMuted((prev) => {
               const next = !prev;
               if (soundRef.current) soundRef.current.muted = next;
               return next;
            });
         } else if (e.ctrlKey && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            toggleFullscreen();
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [status, startRace, resetRace, toggleFullscreen]);

   // Main 60fps Canvas Render & Physics Loop
   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let lastLeaderSync = 0;
      let lastQuackTime = 0;

      const renderFrame = (now: number) => {
         const dpr = window.devicePixelRatio || 1;
         const rect = canvas.getBoundingClientRect();
         if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
         }
         ctx.save();
         ctx.scale(dpr, dpr);

         const width = rect.width;
         const height = rect.height;
         const topBankH = 96;
         const bottomBankH = 36;
         const waterTop = topBankH;
         const waterBottom = height - bottomBankH;
         const waterHeight = Math.max(120, waterBottom - waterTop);

         const totalMs = durationSec * 1000;
         const elapsedMs =
            status === 'RACING'
               ? Math.min(totalMs, now - raceStartPerfRef.current)
               : status === 'FINISHED'
                 ? totalMs
                 : 0;
         const tNorm = totalMs > 0 ? elapsedMs / totalMs : 0; // 0..1

         if (status === 'RACING') {
            setRemainingMs(Math.max(0, totalMs - elapsedMs));
            cameraScrollRef.current += 6.5;
            if (now - lastQuackTime > 1400 && Math.random() < 0.15) {
               soundRef.current?.playQuack();
               lastQuackTime = now;
            }
         } else if (status === 'IDLE') {
            cameraScrollRef.current += 0.8;
         }

         // 1. Draw River Background & Animated Waves
         const waterGrad = ctx.createLinearGradient(0, waterTop, 0, waterBottom);
         waterGrad.addColorStop(0, '#073B4C');
         waterGrad.addColorStop(0.5, '#0A5870');
         waterGrad.addColorStop(1, '#052936');
         ctx.fillStyle = waterGrad;
         ctx.fillRect(0, 0, width, height);

         // Top & Bottom River Banks
         ctx.fillStyle = '#0B1922';
         ctx.fillRect(0, 0, width, waterTop);
         ctx.fillRect(0, waterBottom, width, bottomBankH);

         // Animated Water Ripples
         ctx.strokeStyle = 'rgba(76, 201, 240, 0.14)';
         ctx.lineWidth = 2;
         const waveSpacing = 90;
         const scrollOffset = cameraScrollRef.current % waveSpacing;
         for (let row = 0; row < 8; row++) {
            const y = waterTop + ((row + 0.5) / 8) * waterHeight;
            ctx.beginPath();
            for (let x = -scrollOffset; x < width + waveSpacing; x += waveSpacing) {
               ctx.moveTo(x, y);
               ctx.quadraticCurveTo(x + 22, y - 5, x + 44, y);
            }
            ctx.stroke();
         }

         // 2. Compute Track Coordinates & Finish Line Position
         const startX = Math.max(90, width * 0.1);
         const finishLineTargetX = width * 0.84;
         // Finish line scrolls in from off-screen right during the final 22% of the race
         const finishLineX = tNorm < 0.78 ? width + 300 : finishLineTargetX + ((1 - tNorm) / 0.22) * (width * 0.55);

         // Draw Start Buoy Line (fades out once race is underway)
         if (tNorm < 0.18) {
            const alpha = 1 - tNorm / 0.18;
            ctx.strokeStyle = `rgba(255, 209, 102, ${alpha * 0.5})`;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(startX, waterTop);
            ctx.lineTo(startX, waterBottom);
            ctx.stroke();
            ctx.setLineDash([]);
         }

         // Draw Checkered Finish Line Banner
         if (finishLineX < width + 60) {
            const checkerSize = 14;
            const numRows = Math.ceil(waterHeight / checkerSize);
            for (let r = 0; r < numRows; r++) {
               for (let c = 0; c < 2; c++) {
                  ctx.fillStyle = (r + c) % 2 === 0 ? '#FFFFFF' : '#111827';
                  ctx.fillRect(
                     finishLineX + c * checkerSize,
                     waterTop + r * checkerSize,
                     checkerSize,
                     Math.min(checkerSize, waterBottom - (waterTop + r * checkerSize)),
                  );
               }
            }
            // Finish Line Floating Posts
            ctx.fillStyle = '#EF476F';
            ctx.beginPath();
            ctx.arc(finishLineX + checkerSize, waterTop + 8, 10, 0, Math.PI * 2);
            ctx.arc(finishLineX + checkerSize, waterBottom - 8, 10, 0, Math.PI * 2);
            ctx.fill();
         }

         // 3. Update Duck Positions (Rubber-band Overtaking + Final Sprint Convergence)
         const ducks = ducksRef.current;
         const duckScale = Math.max(0.48, Math.min(1.05, 22 / Math.sqrt(ducks.length)));

         ducks.forEach((duck) => {
            if (status === 'IDLE') {
               duck.progress = 0;
               duck.currentSpeed = 0;
               return;
            }
            // Base linear progress toward duck's final finish target
            const baseProgress = tNorm * duck.finalFinishProgress;
            // Sinusoidal surge bursts that smoothly taper to 0 at tNorm = 1.0
            const envelope = Math.sin(tNorm * Math.PI) * (1 - Math.pow(tNorm, 2.8));
            const surge =
               (Math.sin(tNorm * Math.PI * duck.freq1 + duck.phase1) * 0.085 +
                  Math.cos(tNorm * Math.PI * duck.freq2 + duck.phase2) * 0.045) *
               envelope;

            const nextProgress = Math.max(0, Math.min(1.0, baseProgress + surge));
            duck.currentSpeed = Math.max(0, (nextProgress - duck.progress) * 1000);
            duck.progress = nextProgress;
         });

         // Rank ducks by current progress
         const rankedByProgress = [...ducks].sort((a, b) => b.progress - a.progress);
         const top5Ids = new Set(rankedByProgress.slice(0, 5).map((d) => d.participant.id));

         if (status === 'RACING' && now - lastLeaderSync > 180) {
            setLeaders(rankedByProgress.slice(0, 5));
            lastLeaderSync = now;
         }

         // 4. Draw Ducks Sorted by Vertical Lane (Painter's Algorithm)
         ducks.forEach((duck) => {
            const x = startX + duck.progress * (finishLineTargetX - startX);
            const baseY = waterTop + 26 + duck.laneYRatio * (waterHeight - 52);
            const bobY = Math.sin(now * 0.008 + duck.bobOffset) * 3 * duckScale;
            const pitchRad = Math.sin(now * 0.01 + duck.bobOffset) * 0.07 + (duck.currentSpeed > 1.2 ? -0.06 : 0);
            const y = baseY + bobY;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(duckScale, duckScale);

            // Water Wake Foam Behind Duck
            if (status === 'RACING') {
               ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
               ctx.beginPath();
               ctx.ellipse(-26, 12, 16 + duck.currentSpeed * 6, 4, 0, 0, Math.PI * 2);
               ctx.fill();
            }

            ctx.rotate(pitchRad);

            // Duck Body
            ctx.fillStyle = duck.colorBody;
            ctx.beginPath();
            ctx.ellipse(-4, 4, 22, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#0B1922';
            ctx.stroke();

            // Duck Tail
            ctx.beginPath();
            ctx.moveTo(-22, 0);
            ctx.lineTo(-30, -8);
            ctx.lineTo(-18, -5);
            ctx.closePath();
            ctx.fillStyle = duck.colorBody;
            ctx.fill();
            ctx.stroke();

            // Duck Wing
            ctx.fillStyle = duck.colorWing;
            ctx.beginPath();
            ctx.ellipse(-6, 5, 11, 7, -0.15, 0, Math.PI * 2);
            ctx.fill();

            // Duck Head
            ctx.fillStyle = duck.colorBody;
            ctx.beginPath();
            ctx.arc(14, -9, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Orange Beak
            ctx.fillStyle = '#FB8500';
            ctx.beginPath();
            ctx.moveTo(23, -12);
            ctx.quadraticCurveTo(34, -9, 23, -4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Eye
            ctx.fillStyle = '#0B1922';
            ctx.beginPath();
            ctx.arc(17, -11, 2.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(17.7, -11.7, 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Numbered Bib Badge on Duck Body
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(-14, -2, 18, 12, 4);
            ctx.fill();
            ctx.fillStyle = '#0B1922';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(duck.bibNumber), -5, 4);

            ctx.restore();

            // Floating Name Tag (shown based on labelMode or hover)
            const isLeader = top5Ids.has(duck.participant.id);
            const isHovered = hoveredDuckIdRef.current === duck.participant.id;
            const shouldShowLabel = labelMode === 'ALL' || (labelMode === 'TOP_5' && isLeader) || isHovered;

            if (shouldShowLabel) {
               ctx.save();
               const labelText = `#${duck.bibNumber} ${duck.participant.full_name}`;
               ctx.font = 'bold 11px Inter, sans-serif';
               const textWidth = ctx.measureText(labelText).width;
               const pillW = textWidth + 14;
               const pillH = 20;
               const pillX = x - pillW / 2;
               const pillY = y - 34 * duckScale;

               ctx.fillStyle = isLeader ? 'rgba(17, 24, 39, 0.92)' : 'rgba(17, 24, 39, 0.72)';
               ctx.strokeStyle = isLeader ? '#F59E0B' : 'rgba(255,255,255,0.2)';
               ctx.lineWidth = 1.2;
               ctx.beginPath();
               ctx.roundRect(pillX, pillY, pillW, pillH, 6);
               ctx.fill();
               ctx.stroke();

               ctx.fillStyle = isLeader ? '#FDE68A' : '#F9FAFB';
               ctx.textAlign = 'center';
               ctx.textBaseline = 'middle';
               ctx.fillText(labelText, x, pillY + pillH / 2);
               ctx.restore();
            }
         });

         ctx.restore();

         // 5. Check Race Completion
         if (status === 'RACING' && elapsedMs >= totalMs) {
            setStatus('FINISHED');
            setRemainingMs(0);
            setLeaders(rankedByProgress.slice(0, 5));
            setPodium(rankedByProgress.slice(0, 3));
            soundRef.current?.playVictory();
            confetti({
               particleCount: 110,
               spread: 80,
               origin: { y: 0.55 },
            });
            if (onRaceFinish && rankedByProgress[0]) {
               onRaceFinish(
                  rankedByProgress[0].participant,
                  rankedByProgress.slice(0, 3).map((d) => d.participant),
               );
            }
            return;
         }

         animFrameRef.current = requestAnimationFrame(renderFrame);
      };

      animFrameRef.current = requestAnimationFrame(renderFrame);
      return () => cancelAnimationFrame(animFrameRef.current);
   }, [status, durationSec, labelMode, onRaceFinish]);

   const formattedTimer = useMemo(() => {
      const totalSec = Math.floor(remainingMs / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      const tenths = Math.floor((remainingMs % 1000) / 100);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
   }, [remainingMs]);

   return (
      <div
         ref={wrapperRef}
         className={styles.wrapper()}
      >
         {/* Top Overlay HUD */}
         <div className={styles.topHud()}>
            <div className={styles.brandCard()}>
               <div className={styles.titleRow()}>
                  <Trophy className="h-5 w-5 text-warning-400" />
                  <span className={styles.titleText()}>{prizeName}</span>
               </div>
               <span className={styles.subtitleText()}>
                  Đường đua Vịt Vàng trực tiếp • {activeParticipants.length} vận động viên
               </span>
            </div>

            <div className={styles.timerCard()}>
               <span className={styles.timerLabel()}>Thời gian còn lại</span>
               <span
                  className={
                     status === 'RACING' && remainingMs <= 5000
                        ? `${styles.timerValue()} ${styles.timerValueUrgent()}`
                        : styles.timerValue()
                  }
               >
                  {formattedTimer}
               </span>
            </div>

            <div className={styles.leaderboardCard()}>
               <div className={styles.leaderboardHeader()}>
                  <span>Top 5 Dẫn Đầu</span>
                  <span>Mã vé</span>
               </div>
               {leaders.map((duck, idx) => (
                  <div
                     key={duck.participant.id}
                     className={styles.leaderItem()}
                  >
                     <span
                        className={
                           idx === 0 ? `${styles.leaderRank()} ${styles.leaderRankFirst()}` : styles.leaderRank()
                        }
                     >
                        {idx + 1}
                     </span>
                     <span className={styles.leaderName()}>
                        #{duck.bibNumber} {duck.participant.full_name}
                     </span>
                     <span className={styles.leaderCode()}>{duck.participant.ticket_code}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Main 60FPS Water Track Canvas */}
         <div className={styles.canvasContainer()}>
            <canvas
               ref={canvasRef}
               className={styles.canvas()}
            />
         </div>

         {/* Winner Celebration Modal Overlay */}
         {status === 'FINISHED' && podium[0] && (
            <div className={styles.winnerOverlay()}>
               <div className={styles.winnerModal()}>
                  <div className={styles.winnerBadge()}>
                     <Trophy className="h-4 w-4" />
                     <span>Quán Quân Đường Đua</span>
                  </div>
                  <div className={styles.winnerTitle()}>
                     #{podium[0].bibNumber} {podium[0].participant.full_name}
                  </div>
                  <div className={styles.winnerTicket()}>{podium[0].participant.ticket_code}</div>
                  {podium[0].participant.department && (
                     <div className={styles.winnerMeta()}>Phòng ban: {podium[0].participant.department}</div>
                  )}

                  {podium.length > 1 && (
                     <div className={styles.podiumList()}>
                        {podium.slice(1, 3).map((runnerUp, idx) => (
                           <div
                              key={runnerUp.participant.id}
                              className={styles.podiumRow()}
                           >
                              <span>
                                 Hạng {idx + 2}: #{runnerUp.bibNumber} {runnerUp.participant.full_name}
                              </span>
                              <span className={styles.leaderCode()}>{runnerUp.participant.ticket_code}</span>
                           </div>
                        ))}
                     </div>
                  )}

                  <button
                     type="button"
                     onClick={resetRace}
                     className={styles.btnPrimary()}
                  >
                     <RotateCcw className="h-4 w-4" />
                     <span>Đua Lượt Tiếp Theo</span>
                  </button>
               </div>
            </div>
         )}

         {/* Bottom Operator Control Bar */}
         <div className={styles.bottomBar()}>
            <div className={styles.controlsGroup()}>
               <div className={styles.controlField()}>
                  <Users className="h-4 w-4 text-primary-400" />
                  <span className={styles.controlLabel()}>Số lượng vịt (2-100):</span>
                  <input
                     type="number"
                     min={2}
                     max={100}
                     disabled={status === 'RACING'}
                     value={duckCount}
                     onChange={(e) => setDuckCount(Math.min(100, Math.max(2, Number(e.target.value) || 2)))}
                     className={styles.controlInput()}
                  />
               </div>

               <div className={styles.controlField()}>
                  <span className={styles.controlLabel()}>Thời lượng:</span>
                  <select
                     disabled={status === 'RACING'}
                     value={durationSec}
                     onChange={(e) => setDurationSec(Number(e.target.value))}
                     className={styles.controlSelect()}
                  >
                     <option value={10}>10 giây</option>
                     <option value={15}>15 giây</option>
                     <option value={25}>25 giây</option>
                     <option value={45}>45 giây</option>
                     <option value={60}>60 giây</option>
                  </select>
               </div>

               {status !== 'RACING' ? (
                  <button
                     type="button"
                     onClick={startRace}
                     className={styles.btnPrimary()}
                  >
                     <Play className="h-4 w-4" />
                     <span>Bắt Đầu Đua</span>
                  </button>
               ) : (
                  <button
                     type="button"
                     onClick={resetRace}
                     className={styles.btnDanger()}
                  >
                     <RotateCcw className="h-4 w-4" />
                     <span>Hủy / Đặt Lại</span>
                  </button>
               )}
            </div>

            <div className={styles.controlsGroup()}>
               <button
                  type="button"
                  onClick={() => setLabelMode((prev) => (prev === 'TOP_5' ? 'ALL' : prev === 'ALL' ? 'NONE' : 'TOP_5'))}
                  className={styles.btnSecondary()}
               >
                  <Tag className="h-4 w-4" />
                  <span>Nhãn tên: {labelMode}</span>
               </button>

               <button
                  type="button"
                  onClick={() => {
                     const next = !isMuted;
                     setIsMuted(next);
                     if (soundRef.current) soundRef.current.muted = next;
                  }}
                  className={styles.btnSecondary()}
               >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span>{isMuted ? 'Tắt tiếng' : 'Âm thanh'}</span>
               </button>

               <button
                  type="button"
                  onClick={toggleFullscreen}
                  className={styles.btnSecondary()}
               >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  <span>Toàn màn hình</span>
               </button>
            </div>

            <div className={styles.shortcutHint()}>
               <span>
                  <kbd className={styles.kbd()}>Ctrl+Space</kbd> Bắt đầu/Reset
               </span>
               <span>
                  <kbd className={styles.kbd()}>Ctrl+L</kbd> Nhãn tên
               </span>
               <span>
                  <kbd className={styles.kbd()}>Ctrl+M</kbd> Âm thanh
               </span>
               <span>
                  <kbd className={styles.kbd()}>Ctrl+F</kbd> Fullscreen
               </span>
            </div>
         </div>
      </div>
   );
};
