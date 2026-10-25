/** R17.6: verified public STATIC WEBSITE, not a live Xi peer or fifth fictional world.
 * Evidence is pinned to the successful 2026-10-25 GitHub Actions deploy + verify.
 */
export const XI_COLLABORATION_DOOR = Object.freeze({
  id: "commons.public.xi-phi-bridge",
  title: "Ξ ⇄ Φ · Sovereign Commons Bridge",
  subtitle: "Public engineering collaboration",
  href: "https://michaelwave369.github.io/xi-vessel-bridge/",
  sourceUrl: "https://github.com/MichaelWave369/xi-vessel-bridge",
  label: "Visit verified public Commons Gateway",
  status: "PUBLIC_STATIC_WEBSITE_VERIFIED",
  state: "public-site-verified; external-xi-crossing-not-established",
  proofRunUrl: "https://github.com/MichaelWave369/xi-vessel-bridge/actions/runs/40243474173",
  manifestSha256: "a85309f577e73d20b96fb1442f1f6d0628195805033b456fa81aa39fda9647f3",
  localFixtures: Object.freeze(["R15", "R16"]),
  externalPilot: "BLOCKED",
  realTwoHostTest: "NOT_RUN",
  liveXiConnected: false,
  authorizationGranted: false,
  requiresUserNavigation: true,
  fictionWorld: false,
  proof: "https://github.com/MichaelWave369/xi-vessel-bridge/blob/main/docs/XI_PAGES_LIVE_READINESS_R175.md",
  note: "Only public static HTTPS site availability was verified. This does not authenticate any Xi peer, grant permissions, or imply a live protocol crossing."
});
export function reviewedXiCollaborationDoor() {
  const d = XI_COLLABORATION_DOOR;
  if (d.href !== "https://michaelwave369.github.io/xi-vessel-bridge/" ||
      d.sourceUrl !== "https://github.com/MichaelWave369/xi-vessel-bridge" ||
      d.status !== "PUBLIC_STATIC_WEBSITE_VERIFIED" ||
      d.proofRunUrl !== "https://github.com/MichaelWave369/xi-vessel-bridge/actions/runs/40243474173" ||
      d.manifestSha256 !== "a85309f577e73d20b96fb1442f1f6d0628195805033b456fa81aa39fda9647f3" ||
      d.liveXiConnected !== false || d.authorizationGranted !== false ||
      d.externalPilot !== "BLOCKED" || d.realTwoHostTest !== "NOT_RUN" ||
      d.fictionWorld !== false || d.requiresUserNavigation !== true) {
    throw new Error("Unreviewed Xi Commons public doorway");
  }
  return d;
}
