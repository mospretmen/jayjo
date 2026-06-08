import { useNavigate } from "react-router-dom";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Section className="text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-5xl text-text">We can&apos;t find that page.</h1>
      <p className="mt-4 text-text-muted">It may have moved or never existed.</p>
      <Button className="mt-8" onClick={() => navigate("/")}>
        Back to the studio
      </Button>
    </Section>
  );
}
