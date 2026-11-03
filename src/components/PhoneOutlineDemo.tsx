import React from 'react';
import { APP_CONFIG } from '@/lib/config';
import { Check, X, Sparkles } from 'lucide-react';

export default function PhoneOutlineDemo() {
  return (
    <div className="w-full flex items-center justify-center gap-2.5 sm:gap-8 py-3 sm:py-6 select-none">
      {/* Phone 1: Normal upload (cropped) */}
      <div className="w-[47%] sm:w-[45%] max-w-[155px] sm:max-w-[195px] flex flex-col items-center gap-2 sm:gap-2.5 group">
        <div className="w-full aspect-[9/16] sm:aspect-[9/18] rounded-[22px] sm:rounded-[28px] p-1.5 sm:p-2 bg-gradient-to-b from-slate-900 to-black shadow-apple-md border border-white/10 relative flex flex-col">
          {/* Dynamic Island Notch */}
          <div className="w-8 sm:w-10 h-1.5 sm:h-2 rounded-full bg-black mx-auto mb-1.5 sm:mb-2 flex items-center justify-end px-1 sm:px-1.5 border border-white/5">
            <div className="w-1 h-1 rounded-full bg-rose-500/80" />
          </div>

          {/* Screen with Cropped 4:5 Simulation */}
          <div className="flex-1 w-full rounded-[16px] sm:rounded-[20px] bg-black overflow-hidden flex flex-col relative border border-white/5">
            {/* Top Cut-off Red Stripe */}
            <div className="w-full h-[18%] bg-rose-500/25 border-b border-rose-500/50 flex items-center justify-center">
              <span className="text-[8px] sm:text-[9px] text-rose-300 font-bold tracking-wide flex items-center gap-0.5">
                <X className="w-2.5 h-2.5" /> Cut off
              </span>
            </div>

            {/* Forced 4:5 center */}
            <div className="flex-1 w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">
                Forced 4:5
              </span>
              <span className="text-[7.5px] sm:text-[8px] text-slate-400 mt-0.5 leading-tight">
                Instagram crops edges
              </span>
            </div>

            {/* Bottom Cut-off Red Stripe */}
            <div className="w-full h-[18%] bg-rose-500/25 border-t border-rose-500/50 flex items-center justify-center">
              <span className="text-[8px] sm:text-[9px] text-rose-300 font-bold tracking-wide flex items-center gap-0.5">
                <X className="w-2.5 h-2.5" /> Cut off
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px] sm:text-[13px] font-medium whitespace-nowrap">
          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
          <span>Normal upload</span>
        </div>
      </div>

      {/* Phone 2: With Unframe (full 9:16) */}
      <div className="w-[47%] sm:w-[45%] max-w-[155px] sm:max-w-[195px] flex flex-col items-center gap-2 sm:gap-2.5 group">
        <div className="w-full aspect-[9/16] sm:aspect-[9/18] rounded-[22px] sm:rounded-[28px] p-1.5 sm:p-2 bg-gradient-to-b from-[#13112E] to-black shadow-apple-lg border-2 border-[#00D2FF]/60 relative flex flex-col ring-2 sm:ring-4 ring-[#00D2FF]/20 shadow-[0_0_35px_rgba(0,210,255,0.3)]">
          {/* Dynamic Island Notch */}
          <div className="w-8 sm:w-10 h-1.5 sm:h-2 rounded-full bg-black mx-auto mb-1.5 sm:mb-2 flex items-center justify-end px-1 sm:px-1.5 border border-white/10">
            <div className="w-1 h-1 rounded-full bg-[#00D2FF] shadow-[0_0_6px_#00d2ff]" />
          </div>

          {/* Screen with Full Edge-to-Edge 9:16 Vibrant Neon Gradient */}
          <div className="flex-1 w-full rounded-[16px] sm:rounded-[20px] bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] overflow-hidden flex flex-col items-center justify-between p-2 sm:p-3 relative text-white shadow-inner">
            <div className="w-full flex items-center justify-between opacity-90 pt-0.5">
              <div className="w-3 sm:w-4 h-1 rounded-full bg-white/80" />
              <span className="text-[7.5px] sm:text-[8px] font-bold tracking-wider uppercase bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full">9:16</span>
            </div>

            <div className="flex flex-col items-center text-center my-auto">
              <span className="text-[11px] sm:text-[13px] font-black tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Full 9:16
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold text-white/95 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                Zero cropping
              </span>
            </div>

            <div className="w-full flex items-center justify-center pb-0.5">
              <div className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur-md text-[7.5px] sm:text-[8px] font-bold border border-white/40 shadow-sm flex items-center gap-1">
                <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                <span>100% visible</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#00D2FF]/15 border border-[#00D2FF]/40 text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.25)] text-[11px] sm:text-[13px] font-bold whitespace-nowrap">
          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00D2FF] stroke-[3] shrink-0" />
          <span>With {APP_CONFIG.name}</span>
        </div>
      </div>
    </div>
  );
}
