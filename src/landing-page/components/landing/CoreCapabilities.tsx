import { Icon } from "./Icon";

/**
 * CoreCapabilities — Three feature cards (Intelligent TAS, AI Smart Gate, Digital e-EIR)
 * with progress bars, glassmorphism, and hover glow effects.
 */

const cards = [
  {
    icon: "memory",
    iconColor: "text-primary",
    title: "Intelligent TAS",
    description:
      "Dynamic quota management and flow allocation to prevent peak hour congestion. Ensures continuous operational throughput.",
    progressWidth: "w-3/4",
    progressColor: "bg-primary",
    progressGlow: "shadow-[0_0_10px_rgba(0,240,255,0.8)]",
    percentText: "75%",
    percentColor: "text-primary",
    hoverGlow:
      "hover:shadow-[0_15px_40px_-10px_rgba(0,240,255,0.4)]",
    bgGradient: "from-primary/10",
    cornerBg: "bg-primary/10",
    cornerHover: "group-hover:bg-primary/20",
    iconBorder: "border-primary/30",
    iconHoverBorder: "group-hover:border-primary",
    iconHoverGlow: "group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]",
    titleHoverColor: "group-hover:text-primary",
    delay: "0ms",
  },
  {
    icon: "document_scanner",
    iconColor: "text-[#3b82f6]",
    title: "AI Smart Gate",
    description:
      "Automated Number Plate Recognition (ANPR) triggers barriers instantly, reducing check-in latency from 5 minutes to under 30 seconds.",
    progressWidth: "w-11/12",
    progressColor: "bg-[#3b82f6]",
    progressGlow: "shadow-[0_0_10px_rgba(59,130,246,0.8)]",
    percentText: "92%",
    percentColor: "text-[#3b82f6]",
    hoverGlow:
      "hover:shadow-[0_15px_40px_-10px_rgba(59,130,246,0.4)]",
    bgGradient: "from-[#3b82f6]/10",
    cornerBg: "bg-[#3b82f6]/10",
    cornerHover: "group-hover:bg-[#3b82f6]/20",
    iconBorder: "border-[#3b82f6]/30",
    iconHoverBorder: "group-hover:border-[#3b82f6]",
    iconHoverGlow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]",
    titleHoverColor: "group-hover:text-[#3b82f6]",
    delay: "150ms",
  },
  {
    icon: "data_object",
    iconColor: "text-[#d946ef]",
    title: "Digital e-EIR",
    description:
      "Automated PDF receipt generation accessible via mobile. Completely eliminates the burden of physical document storage.",
    progressWidth: "w-full",
    progressColor: "bg-[#d946ef]",
    progressGlow: "shadow-[0_0_10px_rgba(217,70,239,0.8)]",
    percentText: "100%",
    percentColor: "text-[#d946ef]",
    hoverGlow:
      "hover:shadow-[0_15px_40px_-10px_rgba(217,70,239,0.4)]",
    bgGradient: "from-[#d946ef]/10",
    cornerBg: "bg-[#d946ef]/10",
    cornerHover: "group-hover:bg-[#d946ef]/20",
    iconBorder: "border-[#d946ef]/30",
    iconHoverBorder: "group-hover:border-[#d946ef]",
    iconHoverGlow: "group-hover:shadow-[0_0_20px_rgba(217,70,239,0.6)]",
    titleHoverColor: "group-hover:text-[#d946ef]",
    delay: "300ms",
  },
];

export function CoreCapabilities() {
  return (
    <section className="py-[64px] md:py-[120px] bg-surface relative border-t border-primary/20 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      {/* Radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-surface to-surface" />

      <div className="max-w-[1280px] mx-auto px-[24px] relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4 reveal flex flex-col items-center">
          <div className="px-4 py-1 glass-heavy rounded-full border-primary/30 inline-block mb-4 transition-all hover:border-primary hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest font-bold">
              Mission Parameters
            </span>
          </div>
          <h2 className="font-display-lg text-[40px] md:text-[56px] text-white tracking-tight uppercase font-bold">
            CORE{" "}
            <span className="text-transparent bg-clip-text text-gradient font-bold">
              CAPABILITIES
            </span>
          </h2>
          <p className="font-body-md text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Next-generation automation technologies designed to streamline every
            aspect of port logistics.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`glass-heavy p-8 rounded-2xl group reveal relative overflow-hidden magnetic cursor-pointer ${card.hoverGlow}`}
              style={{ transitionDelay: card.delay }}
            >
              {/* Hover gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Corner glow blob */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${card.cornerBg} rounded-bl-full blur-2xl transition-transform duration-700 group-hover:scale-150 ${card.cornerHover}`}
              />

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-lg bg-surface flex items-center justify-center mb-6 border ${card.iconBorder} ${card.iconHoverBorder} ${card.iconHoverGlow} transition-all duration-300 z-10 relative`}
              >
                <Icon
                  name={card.icon}
                  className={`${card.iconColor} text-2xl group-hover:scale-110 transition-transform`}
                />
              </div>

              {/* Title */}
              <h3
                className={`font-headline-md text-xl mb-4 text-white tracking-widest uppercase ${card.titleHoverColor} transition-colors duration-300 relative z-10 font-bold`}
              >
                {card.title}
              </h3>

              {/* Description */}
              <p className="font-body-md text-slate-400 font-light leading-relaxed relative z-10">
                {card.description}
              </p>

              {/* Progress Bar */}
              <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex justify-between items-center">
                <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                  <div
                    className={`${card.progressColor} ${card.progressWidth} h-full ${card.progressGlow} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/50 w-full animate-[shimmerEffect_2s_infinite] -skew-x-12" />
                  </div>
                </div>
                <span
                  className={`font-headline-md text-[10px] ${card.percentColor} ml-4 font-bold`}
                >
                  {card.percentText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
