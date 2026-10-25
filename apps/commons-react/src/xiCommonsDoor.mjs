/** R17.4: PUBLIC SOURCE doorway, deliberately separate from the four fictional worlds. */
export const XI_COLLABORATION_DOOR = Object.freeze({
  id: "commons.public.xi-phi-bridge",
  title: "Ξ ⇄ Φ · Sovereign Commons Bridge",
  subtitle: "Public engineering collaboration",
  href: "https://github.com/MichaelWave369/xi-vessel-bridge",
  label: "Explore public bridge source and gateway instructions",
  status: "PUBLIC_SOURCE_ONLY",
  state: "partner-offline; external-crossing-not-verified",
  localFixtures: Object.freeze(["R15", "R16"]),
  externalPilot: "BLOCKED",
  realTwoHostTest: "NOT_RUN",
  liveXiConnected: false,
  authorizationGranted: false,
  requiresUserNavigation: true,
  fictionWorld: false,
  proof: "https://github.com/MichaelWave369/xi-vessel-bridge/blob/main/docs/XI_COMMONS_GATEWAY_R173.md",
  note: "Linking a public source repository does not install a PhiOS app, authorize a Xi peer, or prove that GitHub Pages hosting is active."
});
export function reviewedXiCollaborationDoor() {
  const d = XI_COLLABORATION_DOOR;
  if (d.href !== "https://github.com/MichaelWave369/xi-vessel-bridge" ||
      d.liveXiConnected !== false || d.authorizationGranted !== false ||
      d.externalPilot !== "BLOCKED" || d.realTwoHostTest !== "NOT_RUN" ||
      d.fictionWorld !== false || d.requiresUserNavigation !== true) {
    throw new Error("Unreviewed public collaboration door");
  }
  return d;
}
