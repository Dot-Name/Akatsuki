export default function OrbitalLearningSystem() {
  return <div className="orbital-system" aria-hidden="true">
    <div className="orbital-grain" />
    <div className="orbit-depth orbit-depth-back">
      <div className="orbit-ring orbit-ring-one" />
      <div className="orbit-ring orbit-ring-two" />
    </div>
    <div className="orbit-depth orbit-depth-mid">
      <div className="orbit-ring orbit-ring-three" />
      <div className="orbit-ring orbit-ring-four" />
    </div>
    <div className="orbit-depth orbit-depth-front">
      <span className="orbit-core orbit-core-one" />
      <span className="orbit-core orbit-core-two" />
      <span className="orbit-connection orbit-connection-one" />
      <span className="orbit-connection orbit-connection-two" />
    </div>
  </div>;
}
