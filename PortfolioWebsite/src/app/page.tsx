import HeroSection from "@/components/home/HeroSection";
import ProjectSection from "@/components/home/ProjectSection";

export default function Home() {
  const projects = [
    {
      title: "INSIGHT",
      subtitle: "First-Person Puzzle / Unreal Engine 5",
      imageSrc: "/images/Insight/InsightCover.png",
      link: "/works/insight",
    },
    {
      title: "PENGUIN TRADING",
      subtitle: "Multiplayer Coop / Unreal Engine 5",
      imageSrc: "/images/Others/CyberRestaurant.png",
      link: "/works/penguin",
    },
    {
      title: "SLAY THE VIRUS",
      subtitle: "Action Roguelike / Unity",
      imageSrc: "/images/STV/STVTitle.png",
      link: "/works/slay-the-virus",
    },
    {
      title: "PROMETHEUS",
      subtitle: "Sci-Fi Horror / Unreal Engine 5",
      imageSrc: "/images/Prometheus/PrometheusTitle.png",
      link: "/works/prometheus",
    },
    {
      title: "LIGHTING & TECH",
      subtitle: "Environment Art / Procedural Generation",
      imageSrc: "/images/Others/PCG/PCG01.png",
      link: "/works/lighting-atmosphere",
    },
  ];

  return (
    <main className="min-h-screen bg-black w-full overflow-hidden">
      <HeroSection />

      {projects.map((project, index) => (
        <ProjectSection
          key={index}
          title={project.title}
          subtitle={project.subtitle}
          imageSrc={project.imageSrc}
          link={project.link}
        />
      ))}
    </main>
  );
}
