import HeroSection from "@/components/home/HeroSection";
import ProjectSection from "@/components/home/ProjectSection";

export default function Home() {
  const projects = [
    {
      title: "LIGHTING PORTFOLIO",
      subtitle: "Lighting Art / Level Mood",
      imageSrc: "/images/TrainStation/2Day.png",
      link: "/works/lighting-portfolio",
    },
    {
      title: "SLAY THE VIRUS",
      subtitle: "UI / Poster Design / Game Design",
      imageSrc: "/images/STV/STVTitle.png",
      link: "/works/slay-the-virus",
    },
    {
      title: "WOW, OTTO!",
      subtitle: "Lead Designer / Trackball Narrative",
      imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
      link: "/works/wow-otto",
    },
    {
      title: "I'M EXPLODE WITH U",
      subtitle: "Lead Designer / Multiplayer Platformer",
      imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
      link: "/works/im-explode",
    },
    {
      title: "THE PROMETHEUS",
      subtitle: "Lead Designer / Lighting / Stealth",
      imageSrc: "/images/Prometheus/PrometheusTitle.png",
      link: "/works/prometheus",
    },
    {
      title: "SOMEWHERE BETWEEN PARALLAX",
      subtitle: "UI Design / Interactive VR",
      imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
      link: "/works/parallax",
    },
    {
      title: "INSIGHT",
      subtitle: "Lead Designer / Programmer / Writer",
      imageSrc: "/images/Insight/InsightCover.png",
      link: "/works/insight",
    },
    {
      title: "PENGUIN TRADING CO.",
      subtitle: "Lead Designer / Tech Art / PM",
      imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
      link: "/works/penguin",
    },
    {
      title: "HOUDINI PROCEDURAL GENERATION",
      subtitle: "Procedural Env / PCG",
      imageSrc: "/images/Others/PCG/PCG01.png",
      link: "/works/houdini-pcg",
    },
    {
      title: "EPIC STAGE LIGHTING",
      subtitle: "Stage Lighting / Sequencer",
      imageSrc: "/images/Others/Epic.png",
      link: "/works/epic-stage",
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
          index={index}
        />
      ))}
    </main>
  );
}
