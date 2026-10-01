import { useMemo } from "react";
import { Waves, Wind, Mountain } from "lucide-react";
import { Dinosaur } from "@/data/types";
import { getTaxonomyType } from "@/lib/taxonomy";

export function SpeciesAtmosphere({ dino }: { dino: Dinosaur }) {
  const profile = useMemo(() => {
    const taxon = getTaxonomyType(dino);
    if (taxon === "marine_reptile" || /river|lake|swamp|water|coast/i.test(dino.habitat)) {
      return { label: "Aquatic field context", icon: Waves, className: "species-atmosphere--water" };
    }
    if (taxon === "pterosaur") return { label: "Open-air field context", icon: Wind, className: "species-atmosphere--sky" };
    if (/volcanic|mountain|upland|arid|desert/i.test(dino.habitat)) {
      return { label: "Geological field context", icon: Mountain, className: "species-atmosphere--rock" };
    }
    return { label: "Terrestrial field context", icon: Wind, className: "species-atmosphere--land" };
  }, [dino]);
  const Icon = profile.icon;

  return (
    <div className={`species-atmosphere ${profile.className}`} aria-hidden="true">
      <div className="species-atmosphere__grid" />
      <div className="species-atmosphere__glow" />
      <div className="species-atmosphere__label"><Icon /> {profile.label}</div>
    </div>
  );
}

export function getSpeciesAtmosphereClass(dino: Dinosaur) {
  const taxon = getTaxonomyType(dino);
  if (taxon === "marine_reptile" || /river|lake|swamp|water|coast/i.test(dino.habitat)) return "species-page--water";
  if (taxon === "pterosaur") return "species-page--sky";
  if (/volcanic|mountain|upland|arid|desert/i.test(dino.habitat)) return "species-page--rock";
  return "species-page--land";
}

export default SpeciesAtmosphere;

// Ambient texture is intentionally CSS-only: no large image is fetched until a future asset is scientifically vetted.
// The label is hidden from assistive technology because it is atmospheric decoration, not content.
(function registerAtmosphereStyles() {})();
