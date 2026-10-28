import { useGameStore } from '../store/gameStore';

export const GameHUD = () => {
  const { currentSpeed, currentRPM, currentGear, currentTime } = useGameStore();

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-8 font-racing text-white">
      <div className="flex justify-between items-start">
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-gray-400">Checkpoint</div>
          <div className="text-4xl font-black">1 / 15</div>
        </div>
      </div>

      <div className="flex justify-center items-end gap-12 mb-4">
        {/* Speedometer */}
        <div className="flex flex-col items-center">
          <div className="text-6xl font-black italic tracking-tighter leading-none">
            {currentSpeed}
          </div>
          <div className="text-xs uppercase tracking-widest font-bold text-gray-400">KM/H</div>
        </div>

        {/* Gear */}
        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-white/20 bg-black/40 backdrop-blur-md">
          <div className="text-4xl font-black italic">{currentGear}</div>
          <div className="text-[10px] uppercase font-bold text-gray-400">Gear</div>
        </div>

        {/* RPM Meter */}
        <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden border border-white/10 relative">
           <div
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-600 transition-all duration-100"
            style={{ width: `${(currentRPM / 8000) * 100}%` }}
           />
           <div className="absolute inset-0 flex justify-center items-center text-[8px] font-bold text-white uppercase">
             RPM
           </div>
        </div>
      </div>
    </div>
  );
};
