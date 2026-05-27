import { Icon } from "./Icon";

/**
 * FAB — Fixed floating action button (terminal icon) in bottom-right corner.
 */
export function FAB() {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <button className="w-14 h-14 rounded-full glass-heavy border border-primary/50 text-primary shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-center hover:scale-110 hover:bg-primary/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-300 group">
        <Icon
          name="terminal"
          className="text-2xl font-light group-hover:animate-pulse"
        />
      </button>
    </div>
  );
}
