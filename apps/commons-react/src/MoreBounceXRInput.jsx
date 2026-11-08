import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferGeometry, Line, LineBasicMaterial, Quaternion, Raycaster, Vector3 } from "three";
import { JOINT_NAMES, GestureTracker } from "./vendor/overstrings/gesture.mjs";
import { boundedWalk, nearestDeck, readXRStick } from "./moreBounceR2.mjs";

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Actual XRJoint poses only. No webcam access, cross-origin gesture stream or synthetic input. */
function actualHandJoints(frame, hand, refSpace) {
  if (!frame?.getJointPose || !hand?.get || !refSpace) return null;
  const joints = {};
  try {
    for (const key of JOINT_NAMES) {
      const joint = hand.get(key);
      const pose = joint && frame.getJointPose(joint, refSpace);
      if (!pose?.transform?.position) return null;
      const { x, y, z } = pose.transform.position;
      if (![x, y, z].every(Number.isFinite)) return null;
      joints[key] = { x, y, z };
    }
  } catch { return null; }
  return joints;
}

export function XRControllerActions({ send, enterRef, setNotice, worldRef,
  onArcade, handEnabled, setHandStatus }) {
  const { gl, scene } = useThree();
  const held = useRef(new Map());
  const handHeld = useRef(new Map());
  const tracker = useRef(new GestureTracker());
  const raycaster = useRef(new Raycaster());
  const origin = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const rotation = useRef(new Quaternion());
  const point = useRef(new Vector3());
  const player = useRef({ x: 0, z: 0 });
  const worldYaw = useRef(0);
  const snapLatch = useRef(false);
  const handLastStatus = useRef(0);
  const platterA = useRef(new Vector3());
  const platterB = useRef(new Vector3());

  useEffect(() => {
    gl.xr.enabled = true;
    gl.xr.setReferenceSpaceType("local-floor");
    const enter = async () => {
      try {
        if (!navigator.xr) throw new Error("WebXR is not supported by this browser.");
        const session = await navigator.xr.requestSession("immersive-vr", {
          optionalFeatures: ["local-floor", "hand-tracking"]
        });
        await gl.xr.setSession(session);
        setNotice("Quest venue active. Left stick walks, right stick snap-turns, triggers select. Hand DJ mode is opt-in.");
        session.addEventListener("end", () => {
          setNotice("VR session ended. The Backspin booth remains under your control.");
          setHandStatus("Session ended");
          for (const value of held.current.values()) if (value.moved) send("release", { deck: value.deck });
          for (const value of handHeld.current.values()) if (value.moved) send("release", { deck: value.deck });
          held.current.clear(); handHeld.current.clear(); tracker.current.reset();
        }, { once: true });
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Unable to enter VR.");
      }
    };
    enterRef.current = enter;
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
    function pick(controller) {
      controller.updateMatrixWorld();
      controller.getWorldPosition(origin.current);
      controller.getWorldQuaternion(rotation.current);
      direction.current.set(0, 0, -1).applyQuaternion(rotation.current).normalize();
      raycaster.current.set(origin.current, direction.current);
      return raycaster.current.intersectObjects(scene.children, true)
        .find(hit => hit.object.userData.xrAction)?.object.userData ?? null;
    }
    const onStarts = controllers.map(controller => () => {
      const control = pick(controller);
      if (!control) return;
      if (control.xrAction === "platter") {
        controller.getWorldPosition(point.current);
        held.current.set(controller, { deck: control.xrDeck, lastX: point.current.x,
          lastAt: performance.now(), moved: false });
      } else if (control.xrAction === "cue") send("cue", { deck: control.xrDeck });
      else if (control.xrAction === "crossfade") send("crossfade", { value: control.xrValue });
      else if (control.xrAction === "arcade") onArcade();
    });
    const onEnds = controllers.map(controller => () => {
      const value = held.current.get(controller);
      if (!value) return;
      held.current.delete(controller);
      if (value.moved) send("release", { deck: value.deck });
      else send("play", { deck: value.deck });
    });
    const lasers = controllers.map((controller, index) => {
      const geometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, -4)]);
      const material = new LineBasicMaterial({ color: index === 0 ? "#4de0ff" : "#ffa7d9", transparent: true, opacity: 0.75 });
      const line = new Line(geometry, material);
      controller.add(line); scene.add(controller);
      return line;
    });
    controllers.forEach((controller, index) => {
      controller.addEventListener("selectstart", onStarts[index]);
      controller.addEventListener("selectend", onEnds[index]);
    });
    return () => {
      enterRef.current = null;
      controllers.forEach((controller, index) => {
        controller.removeEventListener("selectstart", onStarts[index]);
        controller.removeEventListener("selectend", onEnds[index]);
        controller.remove(lasers[index]);
        lasers[index].geometry.dispose();
        lasers[index].material.dispose();
        scene.remove(controller);
      });
      for (const value of held.current.values()) if (value.moved) send("release", { deck: value.deck });
      for (const value of handHeld.current.values()) if (value.moved) send("release", { deck: value.deck });
      held.current.clear(); handHeld.current.clear(); tracker.current.reset();
    };
  }, [gl, scene, enterRef, setNotice, setHandStatus, send, onArcade]);

  useEffect(() => {
    if (handEnabled) return;
    for (const value of handHeld.current.values()) if (value.moved) send("release", { deck: value.deck });
    handHeld.current.clear();
    tracker.current.reset();
    setHandStatus("Off (controller fallback available)");
  }, [handEnabled, send, setHandStatus]);

  useFrame((_, dt, frame) => {
    if (!gl.xr.isPresenting) return;
    const session = gl.xr.getSession();
    const inputs = Array.from(session?.inputSources || []);
    const left = inputs.find(src => src.handedness === "left" && src.gamepad);
    const right = inputs.find(src => src.handedness === "right" && src.gamepad);
    const move = readXRStick(left?.gamepad);
    const turn = readXRStick(right?.gamepad);
    if (move.x || move.y) {
      gl.xr.getCamera().getWorldDirection(direction.current);
      player.current = boundedWalk(player.current, move, direction.current, dt);
    }
    if (Math.abs(turn.x) > 0.75 && !snapLatch.current) {
      worldYaw.current += Math.sign(turn.x) * (Math.PI / 6);
      snapLatch.current = true;
    } else if (Math.abs(turn.x) < 0.25) snapLatch.current = false;
    if (worldRef.current) {
      worldRef.current.position.set(-player.current.x, 0, -player.current.z);
      worldRef.current.rotation.y = worldYaw.current;
    }

    for (const [controller, value] of held.current) {
      controller.getWorldPosition(point.current);
      const now = performance.now();
      const delta = point.current.x - value.lastX;
      const elapsed = Math.max(0.008, (now - value.lastAt) / 1000);
      value.lastX = point.current.x; value.lastAt = now;
      if (Math.abs(delta) > 0.002 && now - (value.lastSent || 0) > 32) {
        value.moved = true; value.lastSent = now;
        send("scratch", { deck: value.deck, value: clamp((delta / elapsed) * 2.2, -4, 4) });
      }
    }
    if (!handEnabled) return;
    const refSpace = gl.xr.getReferenceSpace();
    const now = performance.now();
    const tracked = [];
    for (const which of ["left", "right"]) {
      const input = inputs.find(src => src.handedness === which && src.hand);
      const joints = actualHandJoints(frame, input?.hand, refSpace);
      if (joints) tracked.push(which);
      const events = tracker.current.update(which, joints, now, "webxr");
      for (const event of events) {
        if (event.gesture !== "pinch") continue;
        if (event.phase === "start" && joints?.["index-finger-tip"] && worldRef.current) {
          worldRef.current.localToWorld(platterA.current.set(-1.45, 1.10, -2.3));
          worldRef.current.localToWorld(platterB.current.set(1.45, 1.10, -2.3));
          const deck = nearestDeck(joints["index-finger-tip"], platterA.current, platterB.current);
          if (deck) handHeld.current.set(which, { deck, lastX: joints["index-finger-tip"].x, lastAt: now, moved: false });
        } else if (event.phase === "end" || event.phase === "lost") {
          const active = handHeld.current.get(which);
          if (active?.moved) send("release", { deck: active.deck });
          handHeld.current.delete(which);
        }
      }
      const active = handHeld.current.get(which);
      if (active && joints?.["index-finger-tip"]) {
        const x = joints["index-finger-tip"].x;
        const delta = x - active.lastX;
        const elapsed = Math.max(0.008, (now - active.lastAt) / 1000);
        active.lastX = x; active.lastAt = now;
        if (Math.abs(delta) > 0.002 && now - (active.lastSent || 0) > 32) {
          active.moved = true; active.lastSent = now;
          send("scratch", { deck: active.deck, value: clamp((delta / elapsed) * 2.2, -4, 4) });
        }
      }
    }
    if (now - handLastStatus.current > 650) {
      handLastStatus.current = now;
      setHandStatus(tracked.length ? `WebXR tracked: ${tracked.join(" and ")}` : "Waiting for real Quest hand joints");
    }
  });

  return null;
}
